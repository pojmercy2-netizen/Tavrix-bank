import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { transactions } from '../../../../database/schema/transactions'
import { withErrorHandler, badRequest } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { parsePagination } from '../../../../utils/pagination'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = event.context.params?.id

  if (!userId) {
    throw badRequest('User ID is required')
  }

  const query = getQuery(event)
  const { limit, offset } = parsePagination(query, 20)

  const db = useDb()

  const list = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .offset(offset)

  const formatted = list.map(tx => ({
    id: tx.id,
    amount: parseFloat(tx.amount),
    description: tx.description,
    type: tx.type,
    status: tx.status,
    method: tx.method,
    reference: tx.reference,
    created_at: tx.createdAt
  }))

  return sendSuccess(event, { data: formatted })
})
