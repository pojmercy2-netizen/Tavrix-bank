import { eq, desc, and } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { transactions } from '../../database/schema/transactions'
import { withErrorHandler } from '../../utils/error'
import { requireActiveUser } from '../../utils/auth'
import { sendSuccess } from '../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const db = useDb()

  // Retrieve all debit transactions of type 'debit' that are bill payments
  const txs = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, authUser.id),
        eq(transactions.type, 'debit')
      )
    )
    .orderBy(desc(transactions.createdAt))

  // Filter and format only the bill pay transactions
  const billPayHistory = txs
    .filter(tx => {
      // Check if it has bill pay metadata or matches description prefix
      const meta = (tx.meta as any) || {}
      return meta.isBillPay === true || (tx.description && tx.description.startsWith('Bill Payment to '))
    })
    .map(tx => {
      const meta = (tx.meta as any) || {}
      return {
        id: tx.id,
        name: meta.payeeName || (tx.description ? tx.description.replace('Bill Payment to ', '') : 'Biller'),
        date: new Date(tx.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        amount: Math.abs(parseFloat(tx.amount)).toFixed(2),
        reference: tx.reference,
        created_at: tx.createdAt
      }
    })

  return sendSuccess(event, billPayHistory)
})
