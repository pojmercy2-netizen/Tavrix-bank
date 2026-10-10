import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { accounts } from '../../database/schema/accounts'
import { transactions } from '../../database/schema/transactions'
import { withErrorHandler, badRequest } from '../../utils/error'
import { requireActiveUser } from '../../utils/auth'
import { sendSuccess } from '../../utils/response'

const billPaySchema = z.object({
  payeeId: z.string(),
  payeeName: z.string(),
  amount: z.number().positive('Amount must be positive'),
  fromAccount: z.enum(['checking', 'savings']),
  memo: z.string().optional()
})

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const body = await readBody(event)
  const validated = billPaySchema.parse(body)

  const db = useDb()

  // Execute in a transaction to ensure balance and transaction are atomic
  const result = await db.transaction(async (tx) => {
    // 1. Fetch user's account
    const [account] = await tx
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, authUser.id),
          eq(accounts.accountType, validated.fromAccount)
        )
      )
      .limit(1)

    if (!account) {
      badRequest(`No ${validated.fromAccount} account found to pay the bill`)
      return
    }

    if (account.isFrozen) {
      badRequest('Your account is currently frozen. Please contact support.')
      return
    }

    const currentBalance = parseFloat(account.balance)
    if (currentBalance < validated.amount) {
      badRequest(`Insufficient funds in your ${validated.fromAccount} account`)
      return
    }

    const newBalance = (currentBalance - validated.amount).toFixed(2)

    // 2. Deduct balance from account
    await tx
      .update(accounts)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(accounts.id, account.id))

    // 3. Create transaction record (debit amount is negative)
    const reference = `BILL${Date.now()}${Math.floor(100 + Math.random() * 900)}`
    const [newTx] = await tx
      .insert(transactions)
      .values({
        accountId: account.id,
        userId: authUser.id,
        type: 'debit',
        amount: (-validated.amount).toFixed(2),
        description: `Bill Payment to ${validated.payeeName}`,
        status: 'completed',
        method: 'Bill Pay',
        reference,
        meta: {
          isBillPay: true,
          payeeId: validated.payeeId,
          payeeName: validated.payeeName,
          memo: validated.memo || null
        }
      })
      .returning()

    return newTx
  })

  return sendSuccess(event, result, `Payment to ${validated.payeeName} processed successfully`, 201)
})
