import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { deposits } from '../../../../database/schema/deposits'
import { accounts } from '../../../../database/schema/accounts'
import { transactions } from '../../../../database/schema/transactions'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const depositId = event.context.params?.id

  if (!depositId) {
    throw badRequest('Deposit ID is required')
  }

  const db = useDb()

  const [deposit] = await db
    .select()
    .from(deposits)
    .where(eq(deposits.id, depositId))
    .limit(1)

  if (!deposit) {
    throw notFound('Deposit')
  }

  if (deposit.status !== 'PENDING') {
    throw badRequest('Only pending deposits can be approved')
  }

  // Find user's checking account
  const [checkingAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, deposit.userId),
        eq(accounts.accountType, 'checking')
      )
    )
    .limit(1)

  const amountVal = parseFloat(deposit.amount)

  await db.transaction(async (tx) => {
    // 1. Approve deposit
    await tx
      .update(deposits)
      .set({
        status: 'APPROVED',
        reviewedBy: admin.id,
        reviewedAt: new Date()
      })
      .where(eq(deposits.id, depositId))

    // 2. Fund user checking account
    let checkingId = checkingAccount?.id
    if (!checkingAccount) {
      const randAcct = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
      const [newAcct] = await tx
        .insert(accounts)
        .values({
          userId: deposit.userId,
          accountNumber: randAcct,
          accountType: 'checking',
          balance: deposit.amount,
          currency: 'USD'
        })
        .returning()
      if (!newAcct) {
        throw new Error('Failed to create checking account')
      }
      checkingId = newAcct.id
    } else {
      const currentBalance = parseFloat(checkingAccount.balance)
      const updatedBalance = (currentBalance + amountVal).toFixed(2)
      await tx
        .update(accounts)
        .set({
          balance: updatedBalance,
          updatedAt: new Date()
        })
        .where(eq(accounts.id, checkingAccount.id))
    }

    // 3. Write completed transaction log
    await tx.insert(transactions).values({
      accountId: checkingId,
      userId: deposit.userId,
      type: 'deposit',
      amount: deposit.amount,
      description: `Funded via ${deposit.method} (Ref: ${deposit.reference})`,
      status: 'completed',
      method: deposit.method,
      reference: deposit.reference
    })
  })

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'APPROVE_DEPOSIT',
    targetType: 'deposits',
    targetId: depositId,
    details: { userId: deposit.userId, amount: deposit.amount }
  })

  return sendSuccess(event, null, 'Deposit request approved and user account funded successfully')
})
