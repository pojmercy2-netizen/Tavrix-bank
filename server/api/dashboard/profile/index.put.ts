import { z } from 'zod'
import { eq, ne, and } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema/users'
import { withErrorHandler, conflict } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  twoFactorEnabled: z.enum(['true', 'false']).optional(),
  emailAlertsEnabled: z.enum(['true', 'false']).optional(),
  smsAlertsEnabled: z.enum(['true', 'false']).optional(),
  transferPin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits').optional()
})

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const body = await readBody(event)
  const validated = updateProfileSchema.parse(body)

  const db = useDb()

  // If email is changing, make sure it is not taken
  if (validated.email) {
    const [existing] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, validated.email),
          ne(users.id, authUser.id)
        )
      )
      .limit(1)

    if (existing) {
      throw conflict('Email is already registered by another user')
    }
  }

  // Build the update object
  const updates: Partial<typeof users.$inferInsert> = {}
  if (validated.fullName !== undefined) updates.fullName = validated.fullName
  if (validated.email !== undefined) updates.email = validated.email
  if (validated.phone !== undefined) updates.phone = validated.phone
  if (validated.address !== undefined) updates.address = validated.address
  if (validated.twoFactorEnabled !== undefined) updates.twoFactorEnabled = validated.twoFactorEnabled
  if (validated.emailAlertsEnabled !== undefined) updates.emailAlertsEnabled = validated.emailAlertsEnabled
  if (validated.smsAlertsEnabled !== undefined) updates.smsAlertsEnabled = validated.smsAlertsEnabled
  if (validated.transferPin !== undefined) updates.transferPin = validated.transferPin

  updates.updatedAt = new Date()

  const [updatedUser] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, authUser.id))
    .returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      address: users.address,
      twoFactorEnabled: users.twoFactorEnabled,
      emailAlertsEnabled: users.emailAlertsEnabled,
      smsAlertsEnabled: users.smsAlertsEnabled,
      hasTransferPin: ne(users.transferPin, '')
    })

  return sendSuccess(event, updatedUser, 'Profile updated successfully')
})
