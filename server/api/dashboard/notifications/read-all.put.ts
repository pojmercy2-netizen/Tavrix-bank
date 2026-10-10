import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { notifications } from '../../../database/schema/notifications'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const db = useDb()

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, authUser.id),
        eq(notifications.isRead, false)
      )
    )

  return sendSuccess(event, null, 'All notifications marked as read')
})
