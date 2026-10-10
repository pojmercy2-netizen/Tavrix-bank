import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { transactions } from '../../../database/schema/transactions'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { parsePagination } from '../../../utils/pagination'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const query = getQuery(event)
  const { limit, offset } = parsePagination(query, 20)

  const db = useDb()

  const txs = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, authUser.id))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .offset(offset)

  // Map db values to what frontend expects
  const formatted = txs.map(tx => ({
    id: tx.id,
    amount: parseFloat(tx.amount),
    description: tx.description,
    type: tx.type,
    status: tx.status,
    method: tx.method,
    reference: tx.reference,
    created_at: tx.createdAt
  }))

  return sendSuccess(event, formatted)
})
