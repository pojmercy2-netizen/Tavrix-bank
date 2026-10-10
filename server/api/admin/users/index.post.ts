import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema/users'
import { accounts } from '../../../database/schema/accounts'
import { transactions } from '../../../database/schema/transactions'
import { hashPassword } from '../../../utils/hash'
import { withErrorHandler, conflict } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'
import { sendEmail, getAdminCreatedUserEmailTemplate } from '../../../utils/email'

const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  balance: z.number().nonnegative().optional().default(0),
  currency: z.string().optional().default('USD'),
  role: z.enum(['user', 'admin', 'superadmin']).optional().default('user'),
  kycStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional().default('unverified'),
  password: z.string().min(8).optional()
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)
  const validated = createUserSchema.parse(body)

  const db = useDb()

  // Verify email uniqueness
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.email))
    .limit(1)

  if (existing) {
    throw conflict('Email is already registered')
  }

  // Handle password creation
  const rawPassword = validated.password || Math.random().toString(36).substring(2, 12) + '!'
  const passwordHash = await hashPassword(rawPassword)

  const finalName = `${validated.firstName} ${validated.lastName}`
  const username = validated.email.split('@')[0] || `user_${Date.now()}`

  // Generate a permanent random magic login token (stored in DB, no expiry)
  const { randomBytes } = await import('node:crypto')
  const magicToken = randomBytes(32).toString('hex')

  // Execute transaction to create user and checking account
  const result = await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({
        email: validated.email,
        fullName: finalName,
        username,
        phone: validated.phone || null,
        passwordHash,
        role: validated.role,
        status: 'active',
        kycStatus: validated.kycStatus,
        // Store permanent magic token — no expiry, stays valid until changed
        passwordResetToken: magicToken
      })
      .returning()

    if (!newUser) {
      throw new Error('Failed to create user record')
    }

    // Create checking account
    const randAcct = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
    const [newAccount] = await tx
      .insert(accounts)
      .values({
        userId: newUser.id,
        accountNumber: randAcct,
        accountType: 'checking',
        balance: validated.balance.toFixed(2),
        currency: validated.currency
      })
      .returning()

    if (!newAccount) {
      throw new Error('Failed to create user checking account')
    }

    // Log the initial balance transaction if positive
    if (validated.balance > 0) {
      await tx
        .insert(transactions)
        .values({
          accountId: newAccount.id,
          userId: newUser.id,
          type: 'deposit',
          amount: validated.balance.toFixed(2),
          description: 'Initial balance deposit by admin',
          status: 'completed',
          method: 'Admin Credit',
          reference: `INIT${Date.now()}`
        })
    }

    return { newUser, rawPassword }
  })

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'CREATE_USER',
    targetType: 'users',
    targetId: result.newUser.id,
    details: { email: validated.email, role: validated.role, balance: validated.balance }
  })

  // Build the permanent magic login link
  const headers = getHeaders(event)
  const protocol = headers['x-forwarded-proto'] || 'http'
  const host = headers.host || 'localhost:3000'
  const origin = `${protocol}://${host}`
  const loginLink = `${origin}/auth/magic?token=${magicToken}`

  // Asynchronously send the welcome email containing credentials and magic link
  const emailContent = getAdminCreatedUserEmailTemplate(
    result.newUser.fullName,
    result.newUser.email,
    loginLink,
    result.rawPassword
  )
  sendEmail({
    to: result.newUser.email,
    subject: 'Your Tavrix Bank Account is Ready',
    text: emailContent.text,
    html: emailContent.html
  }).catch((err) => {
    console.error('[Create User Email Error]', err)
  })

  return sendSuccess(
    event,
    {
      id: result.newUser.id,
      fullName: result.newUser.fullName,
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: result.newUser.email,
      role: result.newUser.role,
      status: result.newUser.status,
      kycStatus: result.newUser.kycStatus,
      balance: validated.balance,
      tempPassword: result.rawPassword,
      login_token: magicToken  // raw permanent token — frontend builds the link with this
    },
    'User account created successfully',
    201
  )
})
