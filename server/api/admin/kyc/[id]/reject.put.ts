import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { kycDocuments } from '../../../../database/schema/kyc_documents'
import { users } from '../../../../database/schema/users'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

const rejectKycSchema = z.object({
  reason: z.string().min(1, 'Reason is required')
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const docId = event.context.params?.id

  if (!docId) {
    throw badRequest('KYC Document ID is required')
  }

  const body = await readBody(event)
  const validated = rejectKycSchema.parse(body)

  const db = useDb()

  const [doc] = await db
    .select()
    .from(kycDocuments)
    .where(eq(kycDocuments.id, docId))
    .limit(1)

  if (!doc) {
    throw notFound('KYC Document')
  }

  await db.transaction(async (tx) => {
    // Reject document status
    await tx
      .update(kycDocuments)
      .set({
        status: 'REJECTED',
        rejectionReason: validated.reason,
        reviewedBy: admin.id,
        reviewedAt: new Date()
      })
      .where(eq(kycDocuments.id, docId))

    // Set user KYC status to rejected
    await tx
      .update(users)
      .set({
        kycStatus: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(users.id, doc.userId))
  })

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'REJECT_KYC',
    targetType: 'kyc_documents',
    targetId: docId,
    details: { userId: doc.userId, reason: validated.reason }
  })

  return sendSuccess(event, null, 'KYC submission rejected successfully')
})
