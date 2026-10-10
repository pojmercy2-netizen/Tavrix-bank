import type { H3Event } from 'h3'
import { useDb } from '../database/client'
import { adminLogs } from '../database/schema/admin_logs'

interface LogOptions {
  adminId: string
  action: string
  targetType?: string
  targetId?: string
  details?: Record<string, any>
}

export async function logAdminAction(event: H3Event, options: LogOptions) {
  try {
    const db = useDb()
    const ipAddress = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress || 'unknown'

    await db.insert(adminLogs).values({
      adminId: options.adminId,
      action: options.action,
      targetType: options.targetType || null,
      targetId: options.targetId || null,
      details: options.details || null,
      ipAddress
    })
  } catch (err) {
    console.error('Failed to log admin action:', err)
  }
}
