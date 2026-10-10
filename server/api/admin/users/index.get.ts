import { sql, ilike, or } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema/users'
import { accounts } from '../../../database/schema/accounts'
import { withErrorHandler } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const query = getQuery(event)
  const searchStr = query.search ? String(query.search) : ''

  const db = useDb()

  // Retrieve users along with their primary checking account balance
  const q = db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      role: users.role,
      status: users.status,
      kycStatus: users.kycStatus,
      balance: sql<string>`coalesce(${accounts.balance}, '0.00')`,
      createdAt: users.createdAt
    })
    .from(users)
    .leftJoin(
      accounts,
      sql`${accounts.userId} = ${users.id} AND ${accounts.accountType} = 'checking'`
    )

  const list = searchStr
    ? await q.where(
        or(
          ilike(users.fullName, `%${searchStr}%`),
          ilike(users.email, `%${searchStr}%`)
        )
      )
    : await q

  // Format to match frontend fields
  const formatted = list.map(item => ({
    id: item.id,
    full_name: item.fullName,
    email: item.email,
    phone: item.phone,
    balance: parseFloat(item.balance),
    is_banned: item.status === 'banned',
    kyc_status: item.kycStatus,
    role: item.role,
    status: item.status,
    created_at: item.createdAt
  }))

  return sendSuccess(event, { data: formatted })
})
