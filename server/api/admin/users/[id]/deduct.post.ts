import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { users } from '../../../../database/schema/users'
import { accounts } from '../../../../database/schema/accounts'
import { transactions } from '../../../../database/schema/transactions'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

const deductSchema = z.object({
  amount: z.number().positive(),
  note: z.string().optional()
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = event.context.params?.id

  if (!userId) {
    throw badRequest('User ID is required')
  }

  const body = await readBody(event)
  const validated = deductSchema.parse(body)

  const db = useDb()

  // Verify target user exists
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!targetUser) {
    throw notFound('User')
  }

  // Find user's checking account
  const [checkingAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.accountType, 'checking')
      )
    )
    .limit(1)

  if (!checkingAccount) {
    throw badRequest('No checking account found to deduct funds from')
  }

  const currentBalance = parseFloat(checkingAccount.balance)
  if (currentBalance < validated.amount) {
    throw badRequest('Deduction amount exceeds user checking account balance')
  }

  const updatedBalance = (currentBalance - validated.amount).toFixed(2)

  await db.transaction(async (tx) => {
    // Deduct checking account balance
    await tx
      .update(accounts)
      .set({
        balance: updatedBalance,
        updatedAt: new Date()
      })
      .where(eq(accounts.id, checkingAccount.id))

    // Add transaction log with negative amount
    await tx.insert(transactions).values({
      accountId: checkingAccount.id,
      userId,
      type: 'withdrawal',
      amount: (-validated.amount).toFixed(2),
      description: validated.note || 'Admin Deduction Debit',
      status: 'completed',
      method: 'Admin Debit',
      reference: `ADM${Date.now()}`
    })
  })

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'DEDUCT_FUNDS',
    targetType: 'users',
    targetId: userId,
    details: { amount: validated.amount, note: validated.note }
  })

  return sendSuccess(event, null, `Successfully deducted $${validated.amount.toFixed(2)} from user account`)
})
