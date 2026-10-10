import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { cards } from '../../../database/schema/cards'
import { accounts } from '../../../database/schema/accounts'
import { withErrorHandler, badRequest } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

const createCardSchema = z.object({
  cardType: z.enum(['debit', 'credit', 'virtual']),
  purpose: z.string().optional()
})

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const body = await readBody(event)
  const validated = createCardSchema.parse(body)

  const db = useDb()

  // Find user's checking account to link the card to
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

  // Generate 16-digit card number
  const prefix = validated.cardType === 'virtual' ? '400012' : '411122'
  const randomDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
  const cardNumber = `${prefix}${randomDigits}`

  // Expiry date (5 years from now in MM/YYYY format)
  const now = new Date()
  const expMonth = String(now.getMonth() + 1).padStart(2, '0')
  const expYear = now.getFullYear() + 5
  const expiryDate = `${expMonth}/${expYear}`

  // CVV
  const cvv = String(Math.floor(100 + Math.random() * 900))

  const [newCard] = await db
    .insert(cards)
    .values({
      userId: authUser.id,
      accountId: checkingAccount ? checkingAccount.id : null,
      cardNumber,
      cardholderName: authUser.fullName || 'Card Holder',
      expiryDate,
      cvv,
      cardType: validated.cardType,
      isFrozen: false,
      status: 'active'
    })
    .returning()

  if (!newCard) {
    throw new Error('Failed to create card')
  }

  return sendSuccess(event, newCard, 'Card created successfully', 201)
})
