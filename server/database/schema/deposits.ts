import { pgTable, uuid, varchar, numeric, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const depositStatusEnum = pgEnum('deposit_status', ['PENDING', 'APPROVED', 'REJECTED'])

export const deposits = pgTable('deposits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reference: varchar('reference', { length: 50 }).notNull().unique(),
  method: varchar('method', { length: 50 }).notNull(),
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  coin: varchar('coin', { length: 20 }),
  walletAddress: text('wallet_address'),
  receiptUrl: text('receipt_url'),
  status: depositStatusEnum('status').notNull().default('PENDING'),
  note: text('note'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export type Deposit = typeof deposits.$inferSelect
export type NewDeposit = typeof deposits.$inferInsert
