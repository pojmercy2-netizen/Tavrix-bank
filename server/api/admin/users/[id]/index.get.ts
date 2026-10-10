import { eq, sql } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { users } from '../../../../database/schema/users'
import { accounts } from '../../../../database/schema/accounts'
import { withErrorHandler, notFound, badRequest } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = event.context.params?.id

  if (!userId) {
    throw badRequest('User ID is required')
  }

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
      createdAt: users.createdAt,
      balance: sql<string>`coalesce(sum(${accounts.balance}), '0.00')`
    })
    .from(users)
    .leftJoin(accounts, eq(accounts.userId, users.id))
    .where(eq(users.id, userId))
    .groupBy(users.id)
    .limit(1)

  if (!user) {
    throw notFound('User')
  }

  return sendSuccess(event, {
    ...user,
    balance: parseFloat(user.balance)
  })
})
