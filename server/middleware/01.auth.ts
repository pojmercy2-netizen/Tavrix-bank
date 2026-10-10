import { requireAuth, requireAdmin, requireActiveUser } from '../utils/auth'
import { ApiError } from '../utils/error'

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''

  // Exclude non-API routes, static assets, public auth routes, and health checks
  if (
    !url.startsWith('/api') ||
    url.startsWith('/api/auth') ||
    url.startsWith('/api/v1/auth') ||
    url === '/api/health'
  ) {
    return
  }

  try {
    // If it's an admin route
    if (url.startsWith('/api/admin') || url.startsWith('/api/v1/admin')) {
      await requireAdmin(event)
      return
    }

    // If it's a dashboard route or core client-facing API
    if (
      url.startsWith('/api/dashboard') ||
      url.startsWith('/api/account') ||
      url.startsWith('/api/user') ||
      url.startsWith('/api/v1/account') ||
      url.startsWith('/api/v1/user')
    ) {
      await requireActiveUser(event)
      return
    }
  } catch (err: any) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      setResponseStatus(event, err.statusCode)
      return {
        success: false,
        error: {
          code: err.code || 'UNAUTHORIZED',
          message: err.message || 'Unauthorized access'
        }
      }
    }
    setResponseStatus(event, 500)
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Auth middleware failed' }
    }
  }
})
