import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { transfers } from '../../../database/schema/transfers'
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
    .from(transfers)
    .where(eq(transfers.userId, authUser.id))
    .orderBy(desc(transfers.createdAt))
    .limit(limit)
    .offset(offset)

  const formatted = list.map(t => ({
    id: t.id,
    method: t.method,
    amount: parseFloat(t.amount),
    recipientEmail: t.recipientEmail,
    recipientName: t.recipientName,
    recipientPhone: t.recipientPhone,
    walletAddress: t.walletAddress,
    coin: t.coin,
    country: t.country,
    currency: t.currency,
    note: t.note,
    status: t.status,
    created_at: t.createdAt
  }))

  return sendSuccess(event, formatted)
})
