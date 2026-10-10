import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { notifications } from '../../../database/schema/notifications'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const db = useDb()

  const list = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, authUser.id))
    .orderBy(desc(notifications.createdAt))

  const formatted = list.map(n => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    isRead: n.isRead,
    created_at: n.createdAt
  }))

  return sendSuccess(event, formatted)
})
