import { eq, desc, sql } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { kycDocuments } from '../../../database/schema/kyc_documents'
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
      id: kycDocuments.id,
      userId: kycDocuments.userId,
      userName: users.fullName,
      userEmail: users.email,
      documentType: kycDocuments.documentType,
      documentNumber: kycDocuments.documentNumber,
      expiryDate: kycDocuments.expiryDate,
      frontImageUrl: kycDocuments.frontImageUrl,
      backImageUrl: kycDocuments.backImageUrl,
      documentUrl: kycDocuments.documentUrl,
      status: kycDocuments.status,
      rejectionReason: kycDocuments.rejectionReason,
      submittedAt: kycDocuments.submittedAt
    })
    .from(kycDocuments)
    .leftJoin(users, eq(kycDocuments.userId, users.id))
    .orderBy(desc(kycDocuments.submittedAt))
    .limit(limit)
    .offset(offset)

  const formatted = list.map(doc => ({
    id: doc.id,
    user_id: doc.userId,
    userName: doc.userName || 'Unknown User',
    userEmail: doc.userEmail || '—',
    document_type: doc.documentType,
    document_number: doc.documentNumber,
    expiry_date: doc.expiryDate,
    front_image_url: doc.frontImageUrl,
    back_image_url: doc.backImageUrl,
    document_url: doc.documentUrl || '#',
    status: doc.status,
    rejection_reason: doc.rejectionReason,
    submitted_at: doc.submittedAt
  }))

  return sendSuccess(event, { data: formatted })
})
