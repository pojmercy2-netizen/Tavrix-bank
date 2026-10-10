import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const adminLogs = pgTable('admin_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 50 }),
  targetId: uuid('target_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export type AdminLog = typeof adminLogs.$inferSelect
export type NewAdminLog = typeof adminLogs.$inferInsert
