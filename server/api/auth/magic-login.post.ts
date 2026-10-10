import { eq } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { sessions } from '../../database/schema/sessions'
import { signAccessToken, signRefreshToken, expiryToMs } from '../../utils/jwt'
import { withErrorHandler, unauthorized, badRequest } from '../../utils/error'
import { sendSuccess } from '../../utils/response'
import { hashToken } from '../../utils/hash'

export default withErrorHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string

  if (!token) {
    throw badRequest('Token is required')
  }

  const db = useDb()

  // Look up user by their stored permanent magic token
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.passwordResetToken, token))
    .limit(1)

  if (!user) {
    throw unauthorized('Invalid or unrecognized magic link. Please contact support.')
  }

  if (user.status === 'suspended' || user.status === 'banned') {
    throw unauthorized(`Your account status is ${user.status}. Access denied.`)
  }

  // Generate fresh session tokens
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role
  }

  const accessToken = signAccessToken(tokenPayload)
  const refreshToken = signRefreshToken(tokenPayload, false)

  // Create session in database
  const ipAddress = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress || '127.0.0.1'
  const userAgent = getHeader(event, 'user-agent') || 'Unknown'
  const deviceInfo = userAgent.split(') ')[0]?.split(' (')[1] || 'Unknown Device'
  const hashedRefreshToken = hashToken(refreshToken)
  const config = useRuntimeConfig()
  const expiryStr = config.jwtRefreshExpiry || '7d'
  const expiresAt = new Date(Date.now() + expiryToMs(expiryStr as string))

  await db
    .insert(sessions)
    .values({
      userId: user.id,
      refreshTokenHash: hashedRefreshToken,
      deviceInfo,
      ipAddress,
      userAgent,
      expiresAt
    })

  // NOTE: We intentionally do NOT clear the passwordResetToken so the link stays permanent.
  // The admin or user can use it again any time to log in.

  // Set secure HTTP-only refresh cookie
  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt
  })

  // Return standard login success payload
  return sendSuccess(event, {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status
    }
  }, 'Magic login successful')
})
