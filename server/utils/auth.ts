import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { useDb } from '../database/client'
import { users } from '../database/schema/users'
import { verifyAccessToken } from './jwt'
import { unauthorized, forbidden } from './error'

export interface AuthContextUser {
  id: string
  email: string
  role: 'user' | 'admin' | 'superadmin'
  status: 'active' | 'suspended' | 'deactivated' | 'banned'
  fullName: string
}

/**
 * Checks request authorization headers, validates the access token,
 * fetches user from DB, and returns the sanitized user info.
 */
export async function requireAuth(event: H3Event): Promise<AuthContextUser> {
  // If already checked and attached to context, return it
  if (event.context.user) {
    return event.context.user
  }

  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw unauthorized('Access token is missing or malformed')
  }

  const token = authHeader.substring(7)
  const decoded = verifyAccessToken(token)

  const db = useDb()
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
      fullName: users.fullName
    })
    .from(users)
    .where(eq(users.id, decoded.sub))
    .limit(1)

  if (!user) {
    throw unauthorized('User no longer exists')
  }

  const contextUser: AuthContextUser = {
    id: user.id,
    email: user.email,
    role: user.role as 'user' | 'admin' | 'superadmin',
    status: user.status as 'active' | 'suspended' | 'deactivated' | 'banned',
    fullName: user.fullName
  }

  // Cache user context on event
  event.context.user = contextUser

  return contextUser
}

/**
 * Guard that verifies the user has the admin or superadmin role.
 */
export async function requireAdmin(event: H3Event): Promise<AuthContextUser> {
  const user = await requireAuth(event)
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw forbidden('Administrator privileges required')
  }
  return user
}

/**
 * Guard that verifies the user is active (not suspended/banned/deactivated).
 */
export async function requireActiveUser(event: H3Event): Promise<AuthContextUser> {
  const user = await requireAuth(event)
  if (user.status !== 'active') {
    throw forbidden(`Your account is currently ${user.status}`)
  }
  return user
}
