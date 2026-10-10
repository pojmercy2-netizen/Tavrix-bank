import { eq, and, ne } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { sessions } from '../../../database/schema/sessions'
import { hashToken } from '../../../utils/hash'
import { withErrorHandler } from '../../../utils/error'
import { requireAuth } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireAuth(event)
  const db = useDb()

  const cookieToken = getCookie(event, 'refresh_token')
  if (cookieToken) {
    const hashed = hashToken(cookieToken)
    await db
      .delete(sessions)
      .where(
        and(
          eq(sessions.userId, authUser.id),
          ne(sessions.refreshTokenHash, hashed)
        )
      )
  } else {
    // If no session token found in cookie, revoke all
    await db.delete(sessions).where(eq(sessions.userId, authUser.id))
  }

  return sendSuccess(event, null, 'Logged out of all other sessions')
})
