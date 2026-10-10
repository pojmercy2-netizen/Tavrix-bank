import { eq } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { users } from '../../../../database/schema/users'
import { withErrorHandler, badRequest, notFound, forbidden } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = event.context.params?.id

  if (!userId) {
    throw badRequest('User ID is required')
  }

  // Prevent self-deletion
  if (userId === admin.id) {
    throw forbidden('You cannot delete your own account')
  }

  const db = useDb()

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!targetUser) {
    throw notFound('User')
  }

  // Prevent deleting superadmins (only superadmin can delete superadmin)
  if (targetUser.role === 'superadmin' && admin.role !== 'superadmin') {
    throw forbidden('Only superadmins can delete superadmin accounts')
  }

  // Log before deletion so we have a record
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'DELETE_USER',
    targetType: 'users',
    targetId: userId,
    details: {
      email: targetUser.email,
      fullName: targetUser.fullName,
      role: targetUser.role
    }
  })

  await db.delete(users).where(eq(users.id, userId))

  return sendSuccess(event, null, 'User deleted successfully')
})
