import { pgTable, uuid, varchar, numeric, text, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'
import { accounts } from './accounts'

export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'transfer', 'debit', 'credit', 'fee'])
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'reversed', 'cancelled'])

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  description: text('description'),
  status: transactionStatusEnum('status').notNull().default('completed'),
  method: varchar('method', { length: 100 }),
  reference: varchar('reference', { length: 100 }),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
