import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema/users'
import { accounts } from '../../../database/schema/accounts'
import { transfers } from '../../../database/schema/transfers'
import { withErrorHandler, badRequest, forbidden } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

const createTransferSchema = z.object({
  method: z.enum(['Bank Transfer', 'Crypto Transfer', 'PayPal', 'PayPay', 'Skrill', 'Google Pay', 'Western Union', 'Wise', 'Payoneer']),
  amount: z.number().positive('Amount must be positive'),
  pin: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  walletAddress: z.string().optional().or(z.literal('')),
  coin: z.string().optional().or(z.literal('')),
  recipientName: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  currency: z.string().optional().or(z.literal('')),
  note: z.string().optional().or(z.literal(''))
})

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const body = await readBody(event)
  const validated = createTransferSchema.parse(body)

  const db = useDb()

  // 1. Get user profile details (check transfer PIN if set)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)

  if (user && user.transferPin) {
    if (!validated.pin) {
      throw forbidden('Transfer PIN is required to complete this transfer')
    }
    if (user.transferPin !== validated.pin) {
      throw badRequest('Invalid transfer PIN')
    }
  }

  // 2. Fetch user's checking account (verify sufficient balance but do NOT deduct yet)
  const [checkingAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, authUser.id),
        eq(accounts.accountType, 'checking')
      )
    )
    .limit(1)

  if (!checkingAccount) {
    throw badRequest('No checking account found to execute transfer')
  }

  const currentBalance = parseFloat(checkingAccount.balance)
  if (currentBalance < validated.amount) {
    throw badRequest('Insufficient funds in checking account')
  }

  // 3. Create transfer as PENDING — no balance deduction, no transaction log yet
  //    Money stays in the account until admin approves.
  const [newTransfer] = await db
    .insert(transfers)
    .values({
      userId: authUser.id,
      method: validated.method,
      amount: validated.amount.toFixed(2),
      recipientEmail: validated.email || null,
      recipientName: validated.recipientName || null,
      recipientPhone: validated.phone || null,
      walletAddress: validated.walletAddress || null,
      coin: validated.coin || null,
      country: validated.country || null,
      currency: validated.currency || 'USD',
      note: validated.note || null,
      status: 'pending'
    })
    .returning()

  return sendSuccess(
    event,
    newTransfer,
    `Transfer of $${validated.amount.toFixed(2)} submitted and is pending admin approval`,
    201
  )
})
