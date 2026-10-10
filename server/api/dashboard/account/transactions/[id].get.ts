import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { transactions } from '../../../../database/schema/transactions'
import { withErrorHandler, notFound, badRequest } from '../../../../utils/error'
import { requireActiveUser } from '../../../../utils/auth'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const txId = event.context.params?.id

  if (!txId) {
    throw badRequest('Transaction ID is required')
  }

  const db = useDb()

  const [tx] = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.id, txId),
        eq(transactions.userId, authUser.id)
      )
    )
    .limit(1)

  if (!tx) {
    throw notFound('Transaction')
  }

  return sendSuccess(event, {
    id: tx.id,
    amount: parseFloat(tx.amount),
    description: tx.description,
    type: tx.type,
    status: tx.status,
    method: tx.method,
    reference: tx.reference,
    created_at: tx.createdAt,
    meta: tx.meta
  })
})
