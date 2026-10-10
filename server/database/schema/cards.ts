import { pgTable, uuid, varchar, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'
import { accounts } from './accounts'

export const cardTypeEnum = pgEnum('card_type', ['debit', 'credit', 'virtual'])
export const cardStatusEnum = pgEnum('card_status', ['active', 'frozen', 'terminated'])

export const cards = pgTable('cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }),
  cardNumber: varchar('card_number', { length: 20 }).notNull().unique(),
  cardholderName: varchar('cardholder_name', { length: 255 }).notNull(),
  expiryDate: varchar('expiry_date', { length: 7 }).notNull(), // MM/YYYY
  cvv: varchar('cvv', { length: 4 }).notNull(),
  cardType: cardTypeEnum('card_type').notNull().default('debit'),
  isFrozen: boolean('is_frozen').notNull().default(false),
  status: cardStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export type Card = typeof cards.$inferSelect
export type NewCard = typeof cards.$inferInsert
