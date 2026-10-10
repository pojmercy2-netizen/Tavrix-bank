import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  deviceInfo: text('device_info'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
