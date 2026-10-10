import { eq, desc, sql } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { deposits } from '../../../database/schema/deposits'
import { users } from '../../../database/schema/users'
import { withErrorHandler } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { parsePagination } from '../../../utils/pagination'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const query = getQuery(event)
  const { limit, offset } = parsePagination(query, 20)

  const db = useDb()

  const list = await db
    .select({
      id: deposits.id,
      userId: deposits.userId,
      userName: users.fullName,
      userEmail: users.email,
      reference: deposits.reference,
      method: deposits.method,
      amount: deposits.amount,
      coin: deposits.coin,
      walletAddress: deposits.walletAddress,
      receiptUrl: deposits.receiptUrl,
      status: deposits.status,
      note: deposits.note,
      createdAt: deposits.createdAt
    })
    .from(deposits)
    .leftJoin(users, eq(deposits.userId, users.id))
    .orderBy(desc(deposits.createdAt))
    .limit(limit)
    .offset(offset)

  const formatted = list.map(d => ({
    id: d.id,
    user_id: d.userId,
    userName: d.userName || 'Unknown User',
    userEmail: d.userEmail || '—',
    reference: d.reference,
    method: d.method,
    amount: parseFloat(d.amount),
    coin: d.coin,
    walletAddress: d.walletAddress,
    receiptUrl: d.receiptUrl,
    status: d.status,
    note: d.note,
    created_at: d.createdAt
  }))

  return sendSuccess(event, { data: formatted })
})
