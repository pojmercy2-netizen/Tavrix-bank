import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { cards } from '../../../database/schema/cards'
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
      id: cards.id,
      userId: cards.userId,
      userName: users.fullName,
      userEmail: users.email,
      cardNumber: cards.cardNumber,
      cardholderName: cards.cardholderName,
      expiryDate: cards.expiryDate,
      cvv: cards.cvv,
      cardType: cards.cardType,
      isFrozen: cards.isFrozen,
      status: cards.status,
      createdAt: cards.createdAt
    })
    .from(cards)
    .leftJoin(users, eq(cards.userId, users.id))
    .orderBy(desc(cards.createdAt))
    .limit(limit)
    .offset(offset)

  const formatted = list.map(c => ({
    id: c.id,
    user_id: c.userId,
    userName: c.userName || 'Unknown User',
    userEmail: c.userEmail || '—',
    card_number: c.cardNumber,
    cardholder_name: c.cardholderName,
    expiry_date: c.expiryDate,
    cvv: c.cvv,
    card_type: c.cardType,
    is_frozen: c.isFrozen,
    status: c.status,
    created_at: c.createdAt
  }))

  return sendSuccess(event, { data: formatted })
})
