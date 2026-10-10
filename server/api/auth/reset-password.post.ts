import { z } from 'zod'
import { eq, and, gt } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { hashPassword } from '../../utils/hash'
import { withErrorHandler, badRequest } from '../../utils/error'
import { sendSuccess } from '../../utils/response'

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export default withErrorHandler(async (event) => {
  const body = await readBody(event)
  const validated = resetSchema.parse(body)

  const db = useDb()

  // Find user by token and ensure token is not expired
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.passwordResetToken, validated.token),
        gt(users.passwordResetExpiresAt, new Date())
      )
    )
    .limit(1)

  if (!user) {
    throw badRequest('Invalid or expired reset token')
  }

  const newHash = await hashPassword(validated.password)

  await db
    .update(users)
    .set({
      passwordHash: newHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null
    })
    .where(eq(users.id, user.id))

  return sendSuccess(event, null, 'Password reset successful')
})
