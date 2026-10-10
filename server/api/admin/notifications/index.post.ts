import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { notifications } from '../../../database/schema/notifications'
import { users } from '../../../database/schema/users'
import { withErrorHandler, badRequest } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'

const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  type: z.string().optional().default('info'),
  audience: z.string().optional().default('all'),
  userId: z.string().optional().nullable() // Can be user ID or Email
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const reqBody = await readBody(event)
  const validated = createNotificationSchema.parse(reqBody)

  const db = useDb()

  if (validated.audience === 'specific' || validated.userId) {
    const identifier = validated.userId || ''
    let targetUserId = identifier

    // If identifier is an email, look up the user ID
    if (identifier.includes('@')) {
      const [foundUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, identifier.toLowerCase().trim()))
        .limit(1)

      if (!foundUser) {
        throw badRequest(`User with email "${identifier}" not found`)
      }
      targetUserId = foundUser.id
    }

    const [inserted] = await db
      .insert(notifications)
      .values({
        userId: targetUserId,
        title: validated.title,
        body: validated.body,
        type: validated.type
      })
      .returning()

    await logAdminAction(event, {
      adminId: admin.id,
      action: 'SEND_NOTIFICATION',
      targetType: 'users',
      targetId: targetUserId,
      details: { title: validated.title }
    })

    return sendSuccess(event, inserted, 'Notification sent successfully')
  } else {
    // Determine user set based on audience ('all' or 'verified')
    const query = db.select({ id: users.id }).from(users)
    
    if (validated.audience === 'verified') {
      query.where(
        and(
          eq(users.status, 'active'),
          eq(users.kycStatus, 'verified')
        )
      )
    } else {
      query.where(eq(users.status, 'active'))
    }

    const targetUsers = await query

    if (targetUsers.length > 0) {
      const inserts = targetUsers.map(u => ({
        userId: u.id,
        title: validated.title,
        body: validated.body,
        type: validated.type
      }))

      await db.insert(notifications).values(inserts)
    }

    await logAdminAction(event, {
      adminId: admin.id,
      action: 'BROADCAST_NOTIFICATION',
      details: { 
        title: validated.title, 
        audience: validated.audience, 
        recipientsCount: targetUsers.length 
      }
    })

    return sendSuccess(
      event, 
      null, 
      `Notification sent to ${targetUsers.length} users (${validated.audience}) successfully`
    )
  }
})

