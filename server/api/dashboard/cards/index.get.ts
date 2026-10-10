import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { cards } from '../../../database/schema/cards'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const db = useDb()

  const userCards = await db
    .select()
    .from(cards)
    .where(eq(cards.userId, authUser.id))

  return sendSuccess(event, userCards, 'Cards retrieved successfully')
})
