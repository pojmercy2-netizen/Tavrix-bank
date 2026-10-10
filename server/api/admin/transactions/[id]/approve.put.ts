import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { transactions } from '../../../../database/schema/transactions'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const txId = event.context.params?.id

  if (!txId) {
    throw badRequest('Transaction ID is required')
  }

  const db = useDb()

  const [tx] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, txId))
    .limit(1)

  if (!tx) {
    throw notFound('Transaction')
  }

  if (tx.status !== 'pending') {
    throw badRequest('Only pending transactions can be approved')
  }

  await db
    .update(transactions)
    .set({
      status: 'completed'
    })
    .where(eq(transactions.id, txId))

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'APPROVE_TRANSACTION',
    targetType: 'transactions',
    targetId: txId,
    details: { amount: tx.amount, type: tx.type }
  })

  return sendSuccess(event, null, 'Transaction approved successfully')
})
