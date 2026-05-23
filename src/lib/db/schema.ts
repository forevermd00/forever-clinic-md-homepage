import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export type SmsStatus =
  | 'sent'
  | 'api_failed'
  | 'network_failed'
  | 'fallback_only';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const passwordResetCodes = pgTable(
  'password_reset_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('prc_user_created_idx').on(t.userId, t.createdAt)],
);

export const phoneVerificationCodes = pgTable(
  'phone_verification_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    phone: text('phone').notNull(),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('pvc_phone_created_idx').on(t.phone, t.createdAt)],
);

export const smsLogs = pgTable(
  'sms_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    phone: text('phone').notNull(),
    status: text('status').notNull().$type<SmsStatus>(),
    nhnResultCode: text('nhn_result_code'),
    nhnResultMessage: text('nhn_result_message'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('sms_phone_created_idx').on(t.phone, t.createdAt)],
);

export const keepaliveLogs = pgTable(
  'keepalive_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    source: text('source').notNull().default('cron'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('kal_created_idx').on(t.createdAt)],
);
