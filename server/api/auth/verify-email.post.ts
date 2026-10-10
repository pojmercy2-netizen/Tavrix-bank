import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { withErrorHandler, badRequest, notFound } from '../../utils/error'
import { sendSuccess } from '../../utils/response'

const verifySchema = z.object({
  token: z.string().optional(),
  email: z.string().email().optional(),
  resend: z.boolean().optional()
})

export default withErrorHandler(async (event) => {
  const body = await readBody(event)
  const validated = verifySchema.parse(body)

  const db = useDb()

  if (validated.token) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, validated.token))
      .limit(1)

    if (!user) {
      throw badRequest('Invalid or expired verification token')
    }

    await db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        emailVerificationToken: null
      })
      .where(eq(users.id, user.id))

    return sendSuccess(event, null, 'Email verified successfully')
  }

  if (validated.resend && validated.email) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email))
      .limit(1)

    if (!user) {
      // Security: do not leak if email exists, return generic success
      return sendSuccess(event, null, 'Verification email resent if address exists')
    }

    const newToken = `verify_${Math.random().toString(36).substring(2, 15)}`
    await db
      .update(users)
      .set({
        emailVerificationToken: newToken
      })
      .where(eq(users.id, user.id))

    // In production, send email here. In dev we log it.
    console.log(`[Email Mock] Verification email sent to ${user.email} with token: ${newToken}`)

    return sendSuccess(event, { token: newToken }, 'Verification email resent')
  }

  throw badRequest('Invalid request parameters')
})
