import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { sessions } from '../../../database/schema/sessions'
import { withErrorHandler, badRequest, notFound } from '../../../utils/error'
import { requireAuth } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireAuth(event)
  const sessionId = event.context.params?.id

  if (!sessionId) {
    throw badRequest('Session ID is required')
  }

  const db = useDb()

  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, authUser.id)
      )
    )
    .limit(1)

  if (!session) {
    throw notFound('Session')
  }

  await db
    .delete(sessions)
    .where(eq(sessions.id, sessionId))

  return sendSuccess(event, null, 'Session revoked successfully')
})
