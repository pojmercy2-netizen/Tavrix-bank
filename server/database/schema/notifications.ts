import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('info'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
