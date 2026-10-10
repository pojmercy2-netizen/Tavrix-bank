import { eq } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { transfers } from '../../../../database/schema/transfers'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const transferId = event.context.params?.id

  if (!transferId) {
    throw badRequest('Transfer ID is required')
  }

  const db = useDb()

  const [transfer] = await db
    .select()
    .from(transfers)
    .where(eq(transfers.id, transferId))
    .limit(1)

  if (!transfer) {
    throw notFound('Transfer')
  }

  if (transfer.status !== 'pending') {
    throw badRequest('Only pending transfers can be rejected')
  }

  // Mark transfer as failed — no balance was deducted, so nothing to restore
  await db
    .update(transfers)
    .set({ status: 'failed' })
    .where(eq(transfers.id, transferId))

  await logAdminAction(event, {
    adminId: admin.id,
    action: 'REJECT_TRANSFER',
    targetType: 'transfers',
    targetId: transferId,
    details: { amount: transfer.amount, method: transfer.method }
  })

  return sendSuccess(event, null, 'Transfer rejected. No funds were deducted from the user account.')
})
