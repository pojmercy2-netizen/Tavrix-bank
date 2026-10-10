import { eq } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { cards } from '../../../../database/schema/cards'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const cardId = event.context.params?.id

  if (!cardId) {
    throw badRequest('Card ID is required')
  }

  const db = useDb()

  const [card] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1)

  if (!card) {
    throw notFound('Card')
  }

  await db
    .update(cards)
    .set({
      isFrozen: false,
      status: 'active'
    })
    .where(eq(cards.id, cardId))

  await logAdminAction(event, {
    adminId: admin.id,
    action: 'UNFREEZE_CARD',
    targetType: 'cards',
    targetId: cardId,
    details: { cardNumber: card.cardNumber }
  })

  return sendSuccess(event, null, 'Card unfrozen successfully')
})
