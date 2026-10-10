import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { transfers } from '../../../../database/schema/transfers'
import { accounts } from '../../../../database/schema/accounts'
import { transactions } from '../../../../database/schema/transactions'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const transferId = event.context.params?.id

  if (!transferId) {
    throw badRequest('Transfer ID is required')
  }

  const db = useDb()

  const [transfer] = await db
    .select()
    .from(transfers)
    .where(eq(transfers.id, transferId))
    .limit(1)

  if (!transfer) {
    throw notFound('Transfer')
  }

  if (transfer.status !== 'pending') {
    throw badRequest('Only pending transfers can be approved')
  }

  // Find user's checking account
  const [checkingAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, transfer.userId),
        eq(accounts.accountType, 'checking')
      )
    )
    .limit(1)

  if (!checkingAccount) {
    throw badRequest('User checking account not found')
  }

  const amountVal = parseFloat(transfer.amount)
  const currentBalance = parseFloat(checkingAccount.balance)

  if (currentBalance < amountVal) {
    throw badRequest('Insufficient funds in user account to process this transfer')
  }

  const newBalance = (currentBalance - amountVal).toFixed(2)

  await db.transaction(async (tx) => {
    // 1. Deduct from user's checking account
    await tx
      .update(accounts)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(accounts.id, checkingAccount.id))

    // 2. Mark transfer as completed
    await tx
      .update(transfers)
      .set({ status: 'completed' })
      .where(eq(transfers.id, transferId))

    // 3. Write transaction log
    await tx.insert(transactions).values({
      accountId: checkingAccount.id,
      userId: transfer.userId,
      type: 'transfer',
      amount: (-amountVal).toFixed(2),
      description: `Sent via ${transfer.method} to ${transfer.recipientName || transfer.recipientEmail || transfer.walletAddress || 'beneficiary'}`,
      status: 'completed',
      method: transfer.method,
      reference: `TRF${Date.now()}`
    })
  })

  await logAdminAction(event, {
    adminId: admin.id,
    action: 'APPROVE_TRANSFER',
    targetType: 'transfers',
    targetId: transferId,
    details: { amount: transfer.amount, method: transfer.method }
  })

  return sendSuccess(event, null, 'Transfer approved, user balance deducted successfully')
})
