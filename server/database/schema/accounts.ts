import { pgTable, uuid, varchar, numeric, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const accountTypeEnum = pgEnum('account_type', ['checking', 'savings', 'business'])

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountNumber: varchar('account_number', { length: 20 }).notNull().unique(),
  accountType: accountTypeEnum('account_type').notNull().default('checking'),
  balance: numeric('balance', { precision: 18, scale: 2 }).notNull().default('0.00'),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  isFrozen: boolean('is_frozen').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
