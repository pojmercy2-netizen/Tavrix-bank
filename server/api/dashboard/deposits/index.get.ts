import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { deposits } from '../../../database/schema/deposits'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { parsePagination } from '../../../utils/pagination'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const query = getQuery(event)
  const { limit, offset } = parsePagination(query, 20)

  const db = useDb()

  const list = await db
    .select()
    .from(deposits)
    .where(eq(deposits.userId, authUser.id))
    .orderBy(desc(deposits.createdAt))
    .limit(limit)
    .offset(offset)

  const formatted = list.map(d => ({
    id: d.id,
    reference: d.reference,
    method: d.method,
    amount: parseFloat(d.amount),
    coin: d.coin,
    walletAddress: d.walletAddress,
    receiptUrl: d.receiptUrl,
    status: d.status,
    note: d.note,
    created_at: d.createdAt
  }))

  return sendSuccess(event, formatted)
})
