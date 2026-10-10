import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { kycDocuments } from '../../../database/schema/kyc_documents'
import { users } from '../../../database/schema/users'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

const submitKycSchema = z.object({
  documentType: z.string().min(2),
  documentNumber: z.string().min(2),
  expiryDate: z.string().optional(),
  frontImage: z.string().optional().nullable(),
  backImage: z.string().optional().nullable()
})

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const body = await readBody(event)
  const validated = submitKycSchema.parse(body)

  const db = useDb()

  const result = await db.transaction(async (tx) => {
    // Insert document details
    const [doc] = await tx
      .insert(kycDocuments)
      .values({
        userId: authUser.id,
        documentType: validated.documentType,
        documentNumber: validated.documentNumber,
        expiryDate: validated.expiryDate || null,
        frontImageUrl: validated.frontImage || null,
        backImageUrl: validated.backImage || null,
        documentUrl: 'mock_kyc_document.png',
        status: 'PENDING'
      })
      .returning()

    // Update user state to pending
    await tx
      .update(users)
      .set({
        kycStatus: 'pending'
      })
      .where(eq(users.id, authUser.id))

    return doc
  })

  return sendSuccess(event, result, 'KYC document submitted successfully', 201)
})
