import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema/users'
import { withErrorHandler, badRequest } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'
import { sendEmail, getAdminCreatedUserEmailTemplate } from '../../../utils/email'
import { randomBytes } from 'node:crypto'

const sendMagicLinkSchema = z.object({
  email: z.string().email()
})

export default withErrorHandler(async (event) => {
  await requireAdmin(event)
  const reqBody = await readBody(event)
  const { email } = sendMagicLinkSchema.parse(reqBody)

  const db = useDb()

  // Fetch the user to get their current magic token (or generate a fresh one)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    throw badRequest('No user found with that email address')
  }

  // Re-use existing token, or generate a new permanent one if missing
  let magicToken = user.passwordResetToken
  if (!magicToken) {
    magicToken = randomBytes(32).toString('hex')
    await db
      .update(users)
      .set({ passwordResetToken: magicToken })
      .where(eq(users.id, user.id))
  }

  // Dynamically build base URL
  const headers = getHeaders(event)
  const protocol = headers['x-forwarded-proto'] || 'http'
  const host = headers.host || 'localhost:3000'
  const origin = `${protocol}://${host}`
  const loginLink = `${origin}/auth/magic?token=${magicToken}`

  const emailContent = getAdminCreatedUserEmailTemplate(
    user.fullName,
    user.email,
    loginLink
  )

  await sendEmail({
    to: user.email,
    subject: 'Your Tavrix Bank Account Login Link',
    text: emailContent.text,
    html: emailContent.html
  })

  return sendSuccess(event, null, 'Magic link sent to user email successfully')
})
