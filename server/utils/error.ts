import type { H3Event, EventHandler } from 'h3'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Wrap a route handler with uniform error handling.
 * Converts ZodErrors, ApiErrors, and unknown errors into the standard error shape.
 */
export function withErrorHandler<T>(handler: (event: H3Event) => Promise<T>): EventHandler {
  return defineEventHandler(async (event: H3Event) => {
    try {
      return await handler(event)
    } catch (err: unknown) {
      // Zod validation errors → 400
      if (err instanceof ZodError) {
        const issues = err.issues || (err as any).errors || []
        const messages = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ')
        setResponseStatus(event, 400)
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: messages,
            details: issues
          }
        }
      }

      // Our own ApiError
      if (err instanceof ApiError) {
        setResponseStatus(event, err.statusCode)
        return {
          success: false,
          error: { code: err.code, message: err.message }
        }
      }

      // H3 errors (createError)
      if (err && typeof err === 'object' && 'statusCode' in err) {
        const h3Err = err as { statusCode: number; message: string; statusMessage?: string }
        setResponseStatus(event, h3Err.statusCode)
        return {
          success: false,
          error: {
            code: `HTTP_${h3Err.statusCode}`,
            message: h3Err.statusMessage || h3Err.message || 'An error occurred'
          }
        }
      }

      // Unknown errors — don't leak internals
      console.error('[TAVRIX API Error]', err)
      setResponseStatus(event, 500)
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' }
      }
    }
  })
}

export function notFound(resource = 'Resource') {
  throw new ApiError(`${resource} not found`, 404, 'NOT_FOUND')
}

export function unauthorized(message = 'Authentication required') {
  throw new ApiError(message, 401, 'UNAUTHORIZED')
}

export function forbidden(message = 'Access denied') {
  throw new ApiError(message, 403, 'FORBIDDEN')
}

export function conflict(message: string) {
  throw new ApiError(message, 409, 'CONFLICT')
}

export function badRequest(message: string) {
  throw new ApiError(message, 400, 'BAD_REQUEST')
}
