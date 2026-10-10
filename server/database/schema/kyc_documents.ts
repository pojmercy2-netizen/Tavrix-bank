import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const kycDocStatusEnum = pgEnum('kyc_doc_status', ['PENDING', 'APPROVED', 'REJECTED'])

export const kycDocuments = pgTable('kyc_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  documentType: varchar('document_type', { length: 100 }).notNull(),
  documentNumber: varchar('document_number', { length: 100 }).notNull(),
  expiryDate: varchar('expiry_date', { length: 30 }),
  frontImageUrl: text('front_image_url'),
  backImageUrl: text('back_image_url'),
  documentUrl: text('document_url'),
  status: kycDocStatusEnum('status').notNull().default('PENDING'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow()
})

export type KycDocument = typeof kycDocuments.$inferSelect
export type NewKycDocument = typeof kycDocuments.$inferInsert
