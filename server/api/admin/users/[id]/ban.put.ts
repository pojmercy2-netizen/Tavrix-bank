import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { users } from '../../../../database/schema/users'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

const banSchema = z.object({
  ban: z.boolean()
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = event.context.params?.id

  if (!userId) {
    throw badRequest('User ID is required')
  }

  const body = await readBody(event)
  const validated = banSchema.parse(body)

  const db = useDb()

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!targetUser) {
    throw notFound('User')
  }

  const targetStatus = validated.ban ? 'banned' : 'active'

  await db
    .update(users)
    .set({
      status: targetStatus,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: validated.ban ? 'BAN_USER' : 'UNBAN_USER',
    targetType: 'users',
    targetId: userId,
    details: { ban: validated.ban }
  })

  return sendSuccess(event, null, `User successfully ${validated.ban ? 'banned' : 'unbanned'}`)
})
