import { z } from 'zod'
import { eq, or } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { accounts } from '../../database/schema/accounts'
import { hashPassword } from '../../utils/hash'
import { withErrorHandler, conflict } from '../../utils/error'
import { sendSuccess } from '../../utils/response'
import { sendEmail, getWelcomeEmailTemplate } from '../../utils/email'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name is too short'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  phone: z.string().min(10).max(15).optional()
})

export default withErrorHandler(async (event) => {
  const body = await readBody(event)
  const validated = registerSchema.parse(body)

  const db = useDb()

  // Check if email or username is already taken
  const checkQuery = [eq(users.email, validated.email)]
  if (validated.username) {
    checkQuery.push(eq(users.username, validated.username))
  }
  const existingUsers = await db.select().from(users).where(or(...checkQuery)).limit(1)

  if (existingUsers.length > 0) {
    throw conflict('Email or username is already registered')
  }

  // Hash password
  const passwordHash = await hashPassword(validated.password)

  // Generate a random username if not provided
  const baseUsername = validated.username || validated.email.split('@')[0]
  const finalUsername = validated.username || `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`

  // Insert user inside transaction
  const result = await db.transaction(async (tx) => {
    const [newUser] = await tx.insert(users).values({
      email: validated.email,
      fullName: validated.full_name,
      username: finalUsername,
      phone: validated.phone || null,
      passwordHash,
      role: 'user',
      status: 'active',
      kycStatus: 'unverified'
    }).returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      username: users.username,
      phone: users.phone,
      role: users.role,
      status: users.status,
      kycStatus: users.kycStatus
    })

    if (!newUser) {
      throw new Error('Failed to create user record')
    }

    // Create an initial checking account
    const randAcct = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
    await tx.insert(accounts).values({
      userId: newUser.id,
      accountNumber: randAcct,
      accountType: 'checking',
      balance: '0.00',
      currency: 'USD'
    })

    return newUser
  })

  // Trigger welcome email asynchronously
  const emailContent = getWelcomeEmailTemplate(result.fullName, result.email)
  sendEmail({
    to: result.email,
    subject: 'Welcome to Tavrix Bank!',
    text: emailContent.text,
    html: emailContent.html
  }).catch((err) => {
    console.error('[Registration Email Error]', err)
  })

  return sendSuccess(event, result, 'Registration successful', 201)
})

