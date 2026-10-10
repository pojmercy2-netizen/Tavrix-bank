import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { verifyPassword, hashPassword } from '../../utils/hash'
import { withErrorHandler, badRequest, unauthorized } from '../../utils/error'
import { requireAuth } from '../../utils/auth'
import { sendSuccess } from '../../utils/response'

const changePasswordSchema = z.object({
  current_password: z.string(),
  new_password: z.string().min(8, 'New password must be at least 8 characters')
})

export default withErrorHandler(async (event) => {
  const authUser = await requireAuth(event)
  const body = await readBody(event)
  const validated = changePasswordSchema.parse(body)

  const db = useDb()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)

  if (!user) {
    throw unauthorized('User session is invalid')
  }

  const isCurrentValid = await verifyPassword(validated.current_password, user.passwordHash)
  if (!isCurrentValid) {
    throw badRequest('Current password is incorrect')
  }

  const newHash = await hashPassword(validated.new_password)

  await db
    .update(users)
    .set({
      passwordHash: newHash
    })
    .where(eq(users.id, user.id))

  return sendSuccess(event, null, 'Password updated successfully')
})
