import { eq, desc, sql } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { transactions } from '../../../database/schema/transactions'
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
      id: transactions.id,
      accountId: transactions.accountId,
      userId: transactions.userId,
      userFullName: users.fullName,
      userEmail: users.email,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      status: transactions.status,
      method: transactions.method,
      reference: transactions.reference,
      createdAt: transactions.createdAt
    })
    .from(transactions)
    .leftJoin(users, eq(transactions.userId, users.id))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .offset(offset)

  const formatted = list.map(tx => ({
    id: tx.id,
    accountId: tx.accountId,
    userId: tx.userId,
    userName: tx.userFullName || 'Unknown User',
    userEmail: tx.userEmail || '—',
    type: tx.type,
    amount: parseFloat(tx.amount),
    description: tx.description,
    status: tx.status,
    method: tx.method,
    reference: tx.reference,
    created_at: tx.createdAt
  }))

  return sendSuccess(event, { data: formatted })
})
