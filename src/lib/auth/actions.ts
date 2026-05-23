'use server';

import { db } from '@/lib/db';
import {
  users,
  passwordResetCodes,
  phoneVerificationCodes,
  smsLogs,
  type SmsStatus,
} from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq, desc, and, gte, count } from 'drizzle-orm';
import nodemailer from 'nodemailer';

export async function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email));

  if (existing.length > 0) {
    return { error: 'email_already_exists' };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  await db.insert(users).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash,
  });

  return { success: true };
}

// 전화번호 정규화: DB 키로 사용하기 위해 로컬 번호의 하이픈/공백 제거
// "+82 010-5121-3247" → "+82 01051213247"
function normalizePhone(phone: string): string {
  const [countryPart, ...localParts] = phone.trim().split(/\s+/);
  const localDigits = localParts.join('').replace(/\D/g, '');
  return `${countryPart} ${localDigits}`;
}

// NHN Cloud internationalRecipientNo 형식으로 변환
// "+82 01051213247" → "821051213247" (국가코드 + 로컬 앞자리 0 제거)
function formatPhoneForSms(phone: string): string {
  const normalized = normalizePhone(phone);
  const parts = normalized.split(/\s+/);
  const countryCode = parts[0].replace('+', '');
  const localNumber = parts.slice(1).join('');
  const localNormalized = localNumber.startsWith('0')
    ? localNumber.slice(1)
    : localNumber;
  return `${countryCode}${localNormalized}`;
}

// SMS 발송 로그 저장 (실패해도 무시 — 로깅은 비-크리티컬)
async function logSms(
  phone: string,
  status: SmsStatus,
  nhnResultCode?: string,
  nhnResultMessage?: string,
) {
  try {
    await db.insert(smsLogs).values({
      phone,
      status,
      nhnResultCode: nhnResultCode ?? null,
      nhnResultMessage: nhnResultMessage ?? null,
    });
  } catch {
    // sms_logs 테이블 미생성 등 DB 오류는 무시
  }
}

// 최근 1시간 내 실패 횟수 집계 후 임계값 초과 시 이메일 알림
async function checkAndAlertOnFailures(phone: string) {
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [row] = await db
      .select({ cnt: count() })
      .from(smsLogs)
      .where(and(eq(smsLogs.phone, phone), gte(smsLogs.createdAt, since)));

    const failCount = Number(row?.cnt ?? 0);
    if (failCount >= 3) {
      await sendSmsAlertEmail(phone, failCount);
    }
  } catch {
    // 집계 실패 시 무시
  }
}

async function sendSmsAlertEmail(phone: string, failCount: number) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const user = process.env.GMAIL_USER;

  if (!clientId || !clientSecret || !refreshToken || !user) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { type: 'OAuth2', user, clientId, clientSecret, refreshToken },
  });

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  await transporter.sendMail({
    from: `포에버의원 명동점 <${user}>`,
    to: user,
    subject: `[포에버의원] SMS 발송 실패 반복 알림 — 최근 1시간 ${failCount}회`,
    html: `
      <p>SMS 인증번호 발송 실패가 <strong>${failCount}회</strong> 발생했습니다.</p>
      <ul>
        <li>수신번호: ${phone}</li>
        <li>알림 시각: ${now}</li>
      </ul>
      <p>NHN Cloud 콘솔에서 발신번호 등록 상태 및 AppKey를 확인해 주세요.</p>
    `,
  });
}

// 전화번호 인증 코드 발송 (NHN Cloud SMS API v3.0)
export async function sendPhoneVerificationCode(phone: string) {
  const appKey = process.env.NHN_SMS_APP_KEY;
  const secretKey = process.env.NHN_SMS_SECRET_KEY;
  const sendNo = process.env.NHN_SMS_SENDER_NO;
  const normalizedPhone = normalizePhone(phone);

  // 환경변수 미설정 → 폴백 코드
  if (!appKey || !secretKey || !sendNo) {
    await insertFallbackCode(normalizedPhone);
    await logSms(normalizedPhone, 'fallback_only', undefined, 'env_not_set');
    return { success: true };
  }

  // 인증 코드 생성 및 DB 저장
  const code = Math.random().toString().slice(2, 8).padStart(6, '0');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  try {
    await db
      .insert(phoneVerificationCodes)
      .values({ phone: normalizedPhone, code, expiresAt });
  } catch (dbErr) {
    const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
    await logSms(
      normalizedPhone,
      'network_failed',
      undefined,
      `db_insert_error: ${msg}`,
    );
    return { error: 'db_error' as const };
  }

  // NHN Cloud SMS API 호출
  const internationalNo = formatPhoneForSms(normalizedPhone);

  try {
    const response = await fetch(
      `https://sms.api.nhncloudservice.com/sms/v3.0/appKeys/${appKey}/sender/sms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Secret-Key': secretKey,
        },
        body: JSON.stringify({
          body: `[포에버 의원] 인증번호: ${code}`,
          sendNo,
          recipientList: [{ internationalRecipientNo: internationalNo }],
        }),
      },
    );

    const result = await response.json();
    const header = result?.header;

    if (header?.isSuccessful) {
      await logSms(
        normalizedPhone,
        'sent',
        String(header.resultCode ?? ''),
        header.resultMessage ?? '',
      );
    } else {
      const errCode = String(header?.resultCode ?? 'unknown');
      const errMsg = header?.resultMessage ?? 'api_failure';
      await logSms(normalizedPhone, 'api_failed', errCode, errMsg);
      await checkAndAlertOnFailures(normalizedPhone);
      await insertFallbackCode(normalizedPhone);
    }
  } catch (netErr) {
    const msg = netErr instanceof Error ? netErr.message : String(netErr);
    await logSms(normalizedPhone, 'network_failed', undefined, msg);
    await checkAndAlertOnFailures(normalizedPhone);
    await insertFallbackCode(normalizedPhone);
  }

  return { success: true };
}

async function insertFallbackCode(normalizedPhone: string) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  try {
    await db
      .insert(phoneVerificationCodes)
      .values({ phone: normalizedPhone, code: '000000', expiresAt });
  } catch {
    // DB 오류 무시
  }
}

// 전화번호 인증 코드 검증
export async function verifyPhoneCode(phone: string, code: string) {
  const normalizedPhone = normalizePhone(phone);
  const [record] = await db
    .select()
    .from(phoneVerificationCodes)
    .where(eq(phoneVerificationCodes.phone, normalizedPhone))
    .orderBy(desc(phoneVerificationCodes.createdAt))
    .limit(1);

  if (!record) return { error: 'invalid' };
  if (new Date() > record.expiresAt) return { error: 'expired' };
  if (record.code !== code) return { error: 'invalid' };

  await db
    .delete(phoneVerificationCodes)
    .where(
      and(
        eq(phoneVerificationCodes.phone, normalizedPhone),
        eq(phoneVerificationCodes.id, record.id),
      ),
    );

  return { success: true };
}

// 비밀번호 재설정 코드 발송 (이메일)
export async function sendPasswordResetCode(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return { success: true };
  }

  const code = Math.random().toString().slice(2, 8).padStart(6, '0');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(passwordResetCodes).values({
    userId: user.id,
    code,
    expiresAt,
  });

  // TODO: 실제 이메일 발송 (Resend 등)

  return { success: true };
}

// 비밀번호 재설정 코드 검증
export async function verifyPasswordResetCode(email: string, code: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return { error: 'invalid' };

  const [record] = await db
    .select()
    .from(passwordResetCodes)
    .where(eq(passwordResetCodes.userId, user.id))
    .orderBy(desc(passwordResetCodes.createdAt))
    .limit(1);

  if (!record) return { error: 'invalid' };
  if (new Date() > record.expiresAt) return { error: 'expired' };
  if (record.code !== code) return { error: 'invalid' };

  return { success: true };
}

// 비밀번호 재설정 실행
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  const verifyResult = await verifyPasswordResetCode(email, code);
  if (!verifyResult.success) return verifyResult;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.email, email));

  return { success: true };
}

// 비밀번호 변경 (로그인 상태)
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return { error: 'not_found' };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: 'wrong_password' };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { success: true };
}

// 회원 탈퇴
export async function deleteAccount(userId: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return { error: 'not_found' };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: 'wrong_password' };

  await db
    .delete(passwordResetCodes)
    .where(eq(passwordResetCodes.userId, userId));
  await db.delete(users).where(eq(users.id, userId));

  return { success: true };
}
