import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { users } from '../../../../database/schema/users'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

const roleSchema = z.object({
  role: z.enum(['user', 'admin', 'superadmin'])
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = event.context.params?.id

  if (!userId) {
    throw badRequest('User ID is required')
  }

  const body = await readBody(event)
  const validated = roleSchema.parse(body)

  const db = useDb()

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!targetUser) {
    throw notFound('User')
  }

  await db
    .update(users)
    .set({
      role: validated.role,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'CHANGE_USER_ROLE',
    targetType: 'users',
    targetId: userId,
    details: { role: validated.role }
  })

  return sendSuccess(event, null, `User role changed to ${validated.role} successfully`)
})
