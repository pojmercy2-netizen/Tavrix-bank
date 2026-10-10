import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { sessions } from '../../database/schema/sessions'
import { verifyPassword, hashToken } from '../../utils/hash'
import { signAccessToken, signRefreshToken, expiryToMs } from '../../utils/jwt'
import { withErrorHandler, unauthorized, badRequest } from '../../utils/error'
import { sendSuccess } from '../../utils/response'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional().default(false)
})

// Simple in-memory rate limiting map: IP -> { attempts, windowStart }
const rateLimitMap = new Map<string, { attempts: number; windowStart: number }>()
const LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_ATTEMPTS = 5

export default withErrorHandler(async (event) => {
  const ipAddress = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress || '127.0.0.1'

  // Basic rate limiter check
  const now = Date.now()
  const rateData = rateLimitMap.get(ipAddress)
  if (rateData) {
    if (now - rateData.windowStart < LIMIT_WINDOW) {
      if (rateData.attempts >= MAX_ATTEMPTS) {
        setResponseStatus(event, 429)
        return {
          success: false,
          error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts. Please try again in 1 minute.' }
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
  const validated = loginSchema.parse(body)

  const db = useDb()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.email))
    .limit(1)

  if (!user) {
    throw unauthorized('Invalid email or password')
  }

  if (user.status === 'suspended' || user.status === 'banned') {
    throw unauthorized(`Your account status is ${user.status}. Access denied.`)
  }

  const isPasswordValid = await verifyPassword(validated.password, user.passwordHash)
  if (!isPasswordValid) {
    throw unauthorized('Invalid email or password')
  }

  // Clear rate limits on success
  rateLimitMap.delete(ipAddress)

  const userAgent = getHeader(event, 'user-agent') || 'Unknown'
  const deviceInfo = userAgent.split(') ')[0]?.split(' (')[1] || 'Unknown Device'

  // Generate tokens
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role
  }

  const accessToken = signAccessToken(tokenPayload)
  const refreshToken = signRefreshToken(tokenPayload, validated.rememberMe)

  // Rotate/Create new session in DB
  const hashedRefreshToken = hashToken(refreshToken)
  const config = useRuntimeConfig()
  const expiryStr = validated.rememberMe ? config.jwtRefreshExpiryRememberMe : config.jwtRefreshExpiry
  const expiresAt = new Date(Date.now() + expiryToMs(expiryStr as string))

  const [session] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      refreshTokenHash: hashedRefreshToken,
      deviceInfo,
      ipAddress,
      userAgent,
      expiresAt
    })
    .returning()

  // Return access_token and refresh_token (remember to send cookie or just JSON)
  // Let's set a secure cookie for refresh token as well, and return access token in JSON
  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt
  })

  return sendSuccess(event, {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status
    }
  }, 'Login successful')
})
