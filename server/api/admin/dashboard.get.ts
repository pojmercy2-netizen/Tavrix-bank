import { sql, eq, and } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { transactions } from '../../database/schema/transactions'
import { kycDocuments } from '../../database/schema/kyc_documents'
import { withErrorHandler } from '../../utils/error'
import { requireAdmin } from '../../utils/auth'
import { sendSuccess } from '../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const db = useDb()

  // 1. Total users
  const [userCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, 'user'))

  // 2. Total transactions
  const [txCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)

  // 3. Pending KYC
  const [kycCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(kycDocuments)
    .where(eq(kycDocuments.status, 'PENDING'))

  // 4. Pending Withdrawals
  const [withdrawalCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'withdrawal'),
        eq(transactions.status, 'pending')
      )
    )

  // 5. Total Volume (sum of transaction amounts)
  const [volumeSum] = await db
    .select({ sum: sql<string>`coalesce(sum(abs(amount::numeric)), '0')` })
    .from(transactions)
    .where(eq(transactions.status, 'completed'))

  return sendSuccess(event, {
    data: {
      total_users: userCount?.count || 0,
      total_transactions: txCount?.count || 0,
      pending_kyc: kycCount?.count || 0,
      active_loans: 3, // mock/simulated loan requests since loan table is simulated
      total_volume: parseFloat(volumeSum?.sum || '0'),
      pending_withdrawals: withdrawalCount?.count || 0
    }
  })
})
