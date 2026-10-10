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

const depositSchema = z.object({
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
  const validated = depositSchema.parse(body)

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

  // Find users checking account
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

  let checkingId = checkingAccount?.id
  let currentBalance = checkingAccount ? parseFloat(checkingAccount.balance) : 0

  await db.transaction(async (tx) => {
    // If checking account does not exist, create one
    if (!checkingAccount) {
      const randAcct = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
      const [newAcct] = await tx
        .insert(accounts)
        .values({
          userId,
          accountNumber: randAcct,
          accountType: 'checking',
          balance: validated.amount.toFixed(2),
          currency: 'USD'
        })
        .returning()
      if (!newAcct) {
        throw new Error('Failed to create checking account')
      }
      checkingId = newAcct.id
    } else {
      // Add balance
      const updatedBalance = (currentBalance + validated.amount).toFixed(2)
      await tx
        .update(accounts)
        .set({
          balance: updatedBalance,
          updatedAt: new Date()
        })
        .where(eq(accounts.id, checkingAccount.id))
    }

    // Add transaction log
    await tx.insert(transactions).values({
      accountId: checkingId,
      userId,
      type: 'deposit',
      amount: validated.amount.toFixed(2),
      description: validated.note || 'Admin Deposit Credit',
      status: 'completed',
      method: 'Admin Credit',
      reference: `ADM${Date.now()}`
    })
  })

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'DEPOSIT_FUNDS',
    targetType: 'users',
    targetId: userId,
    details: { amount: validated.amount, note: validated.note }
  })

  return sendSuccess(event, null, `Successfully deposited $${validated.amount.toFixed(2)} to user account`)
})
