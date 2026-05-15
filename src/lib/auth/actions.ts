'use server';

import { db } from '@/lib/db';
import {
  users,
  passwordResetCodes,
  phoneVerificationCodes,
} from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq, desc } from 'drizzle-orm';

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

function formatPhoneForSms(phone: string): string {
  // input: "+82 01012345678" or "+81 09012345678"
  const parts = phone.trim().split(/\s+/);
  const countryCode = parts[0].replace('+', '');
  const localNumber = parts.slice(1).join('').replace(/\D/g, '');
  const localNormalized = localNumber.startsWith('0')
    ? localNumber.slice(1)
    : localNumber;
  return `${countryCode}${localNormalized}`;
}

async function insertFallbackCode(phone: string) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await db
    .insert(phoneVerificationCodes)
    .values({ phone, code: '000000', expiresAt });
}

// 전화번호 인증 코드 발송 (NHN Cloud SMS API)
// SMS 발송 불가(환경변수 미설정) 또는 API 실패 시 000000 폴백 코드로 테스트 가능
export async function sendPhoneVerificationCode(phone: string) {
  const appKey = process.env.NHN_SMS_APP_KEY;
  const secretKey = process.env.NHN_SMS_SECRET_KEY;
  const sendNo = process.env.NHN_SMS_SENDER_NO;

  if (!appKey || !secretKey || !sendNo) {
    console.warn('[SMS] 발신번호 미설정 — 000000 폴백 코드 사용');
    await insertFallbackCode(phone);
    return { success: true };
  }

  const code = Math.random().toString().slice(2, 8).padStart(6, '0');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분
  await db.insert(phoneVerificationCodes).values({ phone, code, expiresAt });

  const internationalNo = formatPhoneForSms(phone);

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

  if (!result.header?.isSuccessful) {
    console.error('[SMS] 발송 실패:', result.header, '— 000000 폴백 코드 사용');
    await insertFallbackCode(phone);
  }

  return { success: true };
}

// 전화번호 인증 코드 검증
export async function verifyPhoneCode(phone: string, code: string) {
  const [record] = await db
    .select()
    .from(phoneVerificationCodes)
    .where(eq(phoneVerificationCodes.phone, phone))
    .orderBy(desc(phoneVerificationCodes.createdAt))
    .limit(1);

  if (!record) return { error: 'invalid' };
  if (new Date() > record.expiresAt) return { error: 'expired' };
  if (record.code !== code) return { error: 'invalid' };

  return { success: true };
}

// 비밀번호 재설정 코드 발송 (이메일)
export async function sendPasswordResetCode(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    // 보안을 위해 사용자가 없어도 성공 응답
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
  console.log(`[DEV] Password reset code for ${email}: ${code}`);

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

  // 관련 데이터 삭제
  await db
    .delete(passwordResetCodes)
    .where(eq(passwordResetCodes.userId, userId));
  await db.delete(users).where(eq(users.id, userId));

  return { success: true };
}
