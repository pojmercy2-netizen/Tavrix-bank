import jwt from 'jsonwebtoken'

export interface JwtPayload {
  sub: string       // user id
  email: string
  role: string
  type: 'access' | 'refresh'
  sessionId?: string
}

export function signAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  const config = useRuntimeConfig()
  return jwt.sign(
    { ...payload, type: 'access' },
    config.jwtAccessSecret as string,
    { expiresIn: (config.jwtAccessExpiry || '15m') as any }
  )
}

export function signRefreshToken(
  payload: Omit<JwtPayload, 'type'>,
  rememberMe = false
): string {
  const config = useRuntimeConfig()
  const expiresIn = rememberMe
    ? ((config.jwtRefreshExpiryRememberMe || '30d') as any)
    : ((config.jwtRefreshExpiry || '7d') as any)

  return jwt.sign(
    { ...payload, type: 'refresh' },
    config.jwtRefreshSecret as string,
    { expiresIn }
  )
}

export function verifyAccessToken(token: string): JwtPayload {
  const config = useRuntimeConfig()
  try {
    return jwt.verify(token, config.jwtAccessSecret as string) as JwtPayload
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid token'
    throw createError({ statusCode: 401, statusMessage: `Invalid access token: ${msg}` })
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  const config = useRuntimeConfig()
  try {
    return jwt.verify(token, config.jwtRefreshSecret as string) as JwtPayload
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid token'
    throw createError({ statusCode: 401, statusMessage: `Invalid refresh token: ${msg}` })
  }
}

/**
 * Parse expiry string to milliseconds for calculating DB expiresAt
 */
export function expiryToMs(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/)
  if (!match) return 7 * 24 * 60 * 60 * 1000 // default 7d
  const num = match[1] ?? '7'
  const unit = match[2] ?? 'd'
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  }
  return parseInt(num, 10) * (multipliers[unit] ?? 1000)
}
