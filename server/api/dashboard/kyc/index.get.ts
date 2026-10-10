import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { kycDocuments } from '../../../database/schema/kyc_documents'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const db = useDb()

  // Retrieve the latest KYC document submitted
  const [latestDoc] = await db
    .select()
    .from(kycDocuments)
    .where(eq(kycDocuments.userId, authUser.id))
    .orderBy(desc(kycDocuments.submittedAt))
    .limit(1)

  if (!latestDoc) {
    return sendSuccess(event, { status: 'Unverified' })
  }

  return sendSuccess(event, {
    id: latestDoc.id,
    documentType: latestDoc.documentType,
    documentNumber: latestDoc.documentNumber,
    expiryDate: latestDoc.expiryDate,
    frontImageUrl: latestDoc.frontImageUrl,
    backImageUrl: latestDoc.backImageUrl,
    status: latestDoc.status,
    rejectionReason: latestDoc.rejectionReason,
    submittedAt: latestDoc.submittedAt
  })
})
