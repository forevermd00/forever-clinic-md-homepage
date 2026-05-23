import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export type SmsStatus =
  | 'sent'
  | 'api_failed'
  | 'network_failed'
  | 'fallback_only';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const passwordResetCodes = pgTable('password_reset_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const phoneVerificationCodes = pgTable('phone_verification_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const smsLogs = pgTable('sms_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').notNull(),
  status: text('status').notNull().$type<SmsStatus>(),
  nhnResultCode: text('nhn_result_code'),
  nhnResultMessage: text('nhn_result_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const keepaliveLogs = pgTable('keepalive_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  source: text('source').notNull().default('cron'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
