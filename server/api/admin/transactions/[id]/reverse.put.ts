import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { transactions } from '../../../../database/schema/transactions'
import { accounts } from '../../../../database/schema/accounts'
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

  if (tx.status === 'reversed') {
    throw badRequest('Transaction is already reversed')
  }

  const amountVal = parseFloat(tx.amount)

  await db.transaction(async (dbTx) => {
    // If the transaction has an associated account, reverse its balance impact
    if (tx.accountId && tx.status === 'completed') {
      const [account] = await dbTx
        .select()
        .from(accounts)
        .where(eq(accounts.id, tx.accountId))
        .limit(1)

      if (account) {
        // Revert balance. (Note: tx.amount was negative for withdrawal/transfer, positive for deposit)
        // Subtracting tx.amount correctly reverts it: new balance = current - tx.amount
        const currentBalance = parseFloat(account.balance)
        const revertedBalance = (currentBalance - amountVal).toFixed(2)

        await dbTx
          .update(accounts)
          .set({
            balance: revertedBalance,
            updatedAt: new Date()
          })
          .where(eq(accounts.id, account.id))
      }
    }

    // Set transaction status to reversed
    await dbTx
      .update(transactions)
      .set({
        status: 'reversed'
      })
      .where(eq(transactions.id, txId))
  })

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'REVERSE_TRANSACTION',
    targetType: 'transactions',
    targetId: txId,
    details: { amount: tx.amount, type: tx.type }
  })

  return sendSuccess(event, null, 'Transaction reversed and balance reverted successfully')
})
