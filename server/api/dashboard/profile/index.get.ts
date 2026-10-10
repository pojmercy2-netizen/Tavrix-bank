import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema/users'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
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
