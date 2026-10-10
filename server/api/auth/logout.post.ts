import { useDb } from '../../database/client'
import { sessions } from '../../database/schema/sessions'
import { hashToken } from '../../utils/hash'
import { withErrorHandler } from '../../utils/error'
import { sendSuccess } from '../../utils/response'
import { eq } from 'drizzle-orm'

export default withErrorHandler(async (event) => {
  // Try to find the refresh token in cookie or request body
  const cookieToken = getCookie(event, 'refresh_token')
  const body = await readBody(event).catch(() => ({}))
  const token = cookieToken || body?.refresh_token

  if (token) {
    const hashed = hashToken(token)
    const db = useDb()

    // Delete session from DB
    await db.delete(sessions).where(eq(sessions.refreshTokenHash, hashed))
  }

  // Clear refresh token cookie
  deleteCookie(event, 'refresh_token')

  return sendSuccess(event, null, 'Logged out successfully')
})
