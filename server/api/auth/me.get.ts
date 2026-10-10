import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { withErrorHandler } from '../../utils/error'
import { requireAuth } from '../../utils/auth'
import { sendSuccess } from '../../utils/response'
import { eq } from 'drizzle-orm'

export default withErrorHandler(async (event) => {
  const authUser = await requireAuth(event)
  const db = useDb()

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      username: users.username,
      phone: users.phone,
      role: users.role,
      status: users.status,
      kycStatus: users.kycStatus,
      avatarUrl: users.avatarUrl,
      address: users.address,
      currency: users.currency,
      emailVerifiedAt: users.emailVerifiedAt,
      twoFactorEnabled: users.twoFactorEnabled,
      emailAlertsEnabled: users.emailAlertsEnabled,
      smsAlertsEnabled: users.smsAlertsEnabled,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)

  return sendSuccess(event, user)
})
