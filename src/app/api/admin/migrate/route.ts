import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-migrate-secret');
  if (secret !== process.env.ADMIN_MIGRATE_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const results: string[] = [];

  // postgres.js 클라이언트를 직접 사용 (drizzle $client)
  const client = db.$client as import('postgres').Sql;

  try {
    await client`
      CREATE TABLE IF NOT EXISTS phone_verification_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    results.push('✓ phone_verification_codes');

    await client`
      CREATE TABLE IF NOT EXISTS sms_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone TEXT NOT NULL,
        status TEXT NOT NULL,
        nhn_result_code TEXT,
        nhn_result_message TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    results.push('✓ sms_logs');

    return NextResponse.json({ success: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
