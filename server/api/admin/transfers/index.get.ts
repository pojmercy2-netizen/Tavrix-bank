import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { transfers } from '../../../database/schema/transfers'
import { users } from '../../../database/schema/users'
import { withErrorHandler } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { parsePagination } from '../../../utils/pagination'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const query = getQuery(event)
  const { limit, offset } = parsePagination(query, 20)

  const db = useDb()

  const list = await db
    .select({
      id: transfers.id,
      userId: transfers.userId,
      userName: users.fullName,
      userEmail: users.email,
      method: transfers.method,
      amount: transfers.amount,
      recipientName: transfers.recipientName,
      recipientEmail: transfers.recipientEmail,
      walletAddress: transfers.walletAddress,
      note: transfers.note,
      status: transfers.status,
      createdAt: transfers.createdAt
    })
    .from(transfers)
    .leftJoin(users, eq(transfers.userId, users.id))
    .orderBy(desc(transfers.createdAt))
    .limit(limit)
    .offset(offset)

  const formatted = list.map(t => ({
    id: t.id,
    userId: t.userId,
    userName: t.userName || 'Unknown User',
    userEmail: t.userEmail || '—',
    method: t.method,
    amount: parseFloat(t.amount),
    recipientName: t.recipientName,
    recipientEmail: t.recipientEmail,
    walletAddress: t.walletAddress,
    note: t.note,
    status: t.status,
    created_at: t.createdAt
  }))

  return sendSuccess(event, { data: formatted })
})
