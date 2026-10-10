import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { notifications } from '../../../../database/schema/notifications'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireActiveUser } from '../../../../utils/auth'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const notificationId = event.context.params?.id

  if (!notificationId) {
    throw badRequest('Notification ID is required')
  }

  const db = useDb()

  const [notification] = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, authUser.id)
      )
    )
    .limit(1)

  if (!notification) {
    throw notFound('Notification')
  }

  await db
    .update(notifications)
    .set({
      isRead: true
    })
    .where(eq(notifications.id, notificationId))

  return sendSuccess(event, null, 'Notification marked as read')
})
