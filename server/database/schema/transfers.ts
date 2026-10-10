import { pgTable, uuid, varchar, numeric, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const transferStatusEnum = pgEnum('transfer_status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])

export const transfers = pgTable('transfers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  method: varchar('method', { length: 100 }).notNull(),
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  recipientEmail: varchar('recipient_email', { length: 255 }),
  recipientName: varchar('recipient_name', { length: 255 }),
  recipientPhone: varchar('recipient_phone', { length: 50 }),
  walletAddress: text('wallet_address'),
  coin: varchar('coin', { length: 20 }),
  country: varchar('country', { length: 100 }),
  currency: varchar('currency', { length: 10 }),
  note: text('note'),
  status: transferStatusEnum('status').notNull().default('completed'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export type Transfer = typeof transfers.$inferSelect
export type NewTransfer = typeof transfers.$inferInsert
