import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { sessions } from '../../database/schema/sessions'
import { users } from '../../database/schema/users'
import { verifyRefreshToken, signAccessToken, signRefreshToken, expiryToMs } from '../../utils/jwt'
import { hashToken } from '../../utils/hash'
import { withErrorHandler, unauthorized } from '../../utils/error'
import { sendSuccess } from '../../utils/response'

const refreshSchema = z.object({
  refresh_token: z.string().optional()
})

export default withErrorHandler(async (event) => {
  const cookieToken = getCookie(event, 'refresh_token')
  const body = await readBody(event).catch(() => ({}))
  const validated = refreshSchema.parse(body)

  const token = cookieToken || validated.refresh_token
  if (!token) {
    throw unauthorized('Refresh token is missing')
  }

  const decoded = verifyRefreshToken(token)
  const hashedOldToken = hashToken(token)

  const db = useDb()

  // Retrieve current active session
  const [activeSession] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.refreshTokenHash, hashedOldToken))
    .limit(1)

  if (!activeSession || new Date() > activeSession.expiresAt) {
    if (activeSession) {
      await db.delete(sessions).where(eq(sessions.id, activeSession.id))
    }
    deleteCookie(event, 'refresh_token')
    throw unauthorized('Session expired or invalid')
  }

  // Get user details
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.sub))
    .limit(1)

  if (!user || user.status !== 'active') {
    await db.delete(sessions).where(eq(sessions.id, activeSession.id))
    deleteCookie(event, 'refresh_token')
    throw unauthorized('User account is suspended or no longer exists')
  }

  // Session rotation: generate new token pair
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role
  }

  const newAccessToken = signAccessToken(tokenPayload)
  const newRefreshToken = signRefreshToken(tokenPayload)
  const hashedNewToken = hashToken(newRefreshToken)

  const config = useRuntimeConfig()
  const expiryMs = expiryToMs(config.jwtRefreshExpiry as string)
  const newExpiresAt = new Date(Date.now() + expiryMs)

  // Update session with new hash and expiration
  await db
    .update(sessions)
    .set({
      refreshTokenHash: hashedNewToken,
      expiresAt: newExpiresAt,
      lastActiveAt: new Date()
    })
    .where(eq(sessions.id, activeSession.id))

  setCookie(event, 'refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: newExpiresAt
  })

  return sendSuccess(event, {
    access_token: newAccessToken,
    refresh_token: newRefreshToken
  }, 'Token rotated successfully')
})
