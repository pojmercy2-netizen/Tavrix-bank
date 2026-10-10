import { z } from 'zod'
import { useDb } from '../../../database/client'
import { deposits } from '../../../database/schema/deposits'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

const createDepositSchema = z.object({
  method: z.string().min(2),
  amount: z.number().positive(),
  coin: z.string().optional(),
  walletAddress: z.string().optional(),
  receiptUrl: z.string().optional(),
  note: z.string().optional()
})

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const body = await readBody(event)
  const validated = createDepositSchema.parse(body)

  const db = useDb()

  const reference = `DEP${Date.now()}${Math.floor(100 + Math.random() * 900)}`

  const [newDeposit] = await db
    .insert(deposits)
    .values({
      userId: authUser.id,
      reference,
      method: validated.method,
      amount: validated.amount.toFixed(2),
      coin: validated.coin || null,
      walletAddress: validated.walletAddress || null,
      receiptUrl: validated.receiptUrl || 'mock_receipt_image.png',
      status: 'PENDING',
      note: validated.note || null
    })
    .returning()

  if (!newDeposit) {
    throw new Error('Failed to submit deposit request')
  }

  return sendSuccess(
    event,
    {
      id: newDeposit.id,
      reference: newDeposit.reference,
      method: newDeposit.method,
      amount: parseFloat(newDeposit.amount),
      status: newDeposit.status,
      created_at: newDeposit.createdAt
    },
    'Deposit request submitted successfully',
    201
  )
})
