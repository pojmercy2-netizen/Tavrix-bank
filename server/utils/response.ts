import type { H3Event } from 'h3'

/**
 * Send a standardised success response
 */
export function sendSuccess<T>(
  event: H3Event,
  data: T,
  message?: string,
  statusCode = 200
) {
  setResponseStatus(event, statusCode)
  return {
    success: true,
    data,
    ...(message ? { message } : {})
  }
}

/**
 * Send a standardised error response (named sendErrorResponse to avoid conflict with H3's sendError)
 */
export function sendErrorResponse(
  event: H3Event,
  message: string,
  code = 'INTERNAL_ERROR',
  statusCode = 500
) {
  setResponseStatus(event, statusCode)
  return {
    success: false,
    error: { code, message }
  }
}
