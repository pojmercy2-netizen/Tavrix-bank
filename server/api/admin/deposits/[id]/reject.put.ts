import { eq } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { deposits } from '../../../../database/schema/deposits'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const depositId = event.context.params?.id

  if (!depositId) {
    throw badRequest('Deposit ID is required')
  }

  const db = useDb()

  const [deposit] = await db
    .select()
    .from(deposits)
    .where(eq(deposits.id, depositId))
    .limit(1)

  if (!deposit) {
    throw notFound('Deposit')
  }

  if (deposit.status !== 'PENDING') {
    throw badRequest('Only pending deposits can be rejected')
  }

  await db
    .update(deposits)
    .set({
      status: 'REJECTED',
      reviewedBy: admin.id,
      reviewedAt: new Date()
    })
    .where(eq(deposits.id, depositId))

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'REJECT_DEPOSIT',
    targetType: 'deposits',
    targetId: depositId,
    details: { userId: deposit.userId, amount: deposit.amount }
  })

  return sendSuccess(event, null, 'Deposit request rejected successfully')
})
