'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

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
    return { error: '이미 등록된 이메일입니다.' };
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
