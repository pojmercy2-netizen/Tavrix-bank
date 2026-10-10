import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'superadmin'])
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'deactivated', 'banned'])
export const kycStatusEnum = pgEnum('kyc_status', ['unverified', 'pending', 'verified', 'rejected'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).unique(),
  phone: varchar('phone', { length: 30 }),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  status: userStatusEnum('status').notNull().default('active'),
  kycStatus: kycStatusEnum('kyc_status').notNull().default('unverified'),
  avatarUrl: text('avatar_url'),
  address: text('address'),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  transferPin: text('transfer_pin'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  emailVerificationToken: text('email_verification_token'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpiresAt: timestamp('password_reset_expires_at', { withTimezone: true }),
  twoFactorEnabled: varchar('two_factor_enabled', { length: 5 }).notNull().default('false'),
  emailAlertsEnabled: varchar('email_alerts_enabled', { length: 5 }).notNull().default('true'),
  smsAlertsEnabled: varchar('sms_alerts_enabled', { length: 5 }).notNull().default('false'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
