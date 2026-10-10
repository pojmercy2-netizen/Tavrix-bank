import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { withErrorHandler } from '../../utils/error'
import { sendSuccess } from '../../utils/response'

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

const rateLimitMap = new Map<string, { attempts: number; windowStart: number }>()
const LIMIT_WINDOW = 60 * 1000
const MAX_ATTEMPTS = 3

export default withErrorHandler(async (event) => {
  const ipAddress = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress || '127.0.0.1'

  // Rate limiter check
  const now = Date.now()
  const rateData = rateLimitMap.get(ipAddress)
  if (rateData) {
    if (now - rateData.windowStart < LIMIT_WINDOW) {
      if (rateData.attempts >= MAX_ATTEMPTS) {
        setResponseStatus(event, 429)
        return {
          success: false,
          error: { code: 'TOO_MANY_REQUESTS', message: 'Too many password reset requests. Try again in 1 minute.' }
        }
      }
      rateData.attempts++
    } else {
      rateLimitMap.set(ipAddress, { attempts: 1, windowStart: now })
    }
  } else {
    rateLimitMap.set(ipAddress, { attempts: 1, windowStart: now })
  }

  const body = await readBody(event)
  const validated = forgotPasswordSchema.parse(body)

  const db = useDb()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.email))
    .limit(1)

  // Do not leak if user exists - always return generic success message
  if (!user) {
    return sendSuccess(event, null, 'If the email exists, a reset link will be sent shortly.')
  }

  const resetToken = `reset_${Math.random().toString(36).substring(2, 15)}`
  const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry

  await db
    .update(users)
    .set({
      passwordResetToken: resetToken,
      passwordResetExpiresAt: resetExpiresAt
    })
    .where(eq(users.id, user.id))

  // In dev / logs, mock the reset URL
  console.log(`[Email Mock] Reset password link for ${user.email}: http://localhost:3000/auth/reset-password?token=${resetToken}`)

  return sendSuccess(event, null, 'If the email exists, a reset link will be sent shortly.')
})
