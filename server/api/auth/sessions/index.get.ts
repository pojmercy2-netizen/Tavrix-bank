import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { sessions } from '../../../database/schema/sessions'
import { withErrorHandler } from '../../../utils/error'
import { requireAuth } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireAuth(event)
  const db = useDb()

  const activeSessions = await db
    .select({
      id: sessions.id,
      deviceInfo: sessions.deviceInfo,
      ipAddress: sessions.ipAddress,
      userAgent: sessions.userAgent,
      lastActiveAt: sessions.lastActiveAt,
      createdAt: sessions.createdAt
    })
    .from(sessions)
    .where(eq(sessions.userId, authUser.id))
    .orderBy(desc(sessions.lastActiveAt))

  return sendSuccess(event, activeSessions)
})
