import { z } from 'zod'
import { eq, ne, and } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { users } from '../../../../database/schema/users'
import { withErrorHandler, badRequest, notFound, conflict } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

const updateContactSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional().nullable()
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = event.context.params?.id

  if (!userId) {
    throw badRequest('User ID is required')
  }

  const body = await readBody(event)
  const validated = updateContactSchema.parse(body)

  const db = useDb()

  // Verify target user exists
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!targetUser) {
    throw notFound('User')
  }

  // Ensure email uniqueness excluding target user
  const [emailCheck] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, validated.email),
        ne(users.id, userId)
      )
    )
    .limit(1)

  if (emailCheck) {
    throw conflict('Email is already registered by another user')
  }

  await db
    .update(users)
    .set({
      email: validated.email,
      phone: validated.phone || null,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'UPDATE_USER_CONTACT',
    targetType: 'users',
    targetId: userId,
    details: { email: validated.email, phone: validated.phone }
  })

  return sendSuccess(event, null, 'User contact info updated successfully')
})
