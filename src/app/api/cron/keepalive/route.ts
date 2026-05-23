import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { keepaliveLogs } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Vercel Cron은 Authorization 헤더로 검증
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // keepalive_logs 테이블이 없으면 생성
    const client = db.$client as import('postgres').Sql;
    await client`
      CREATE TABLE IF NOT EXISTS keepalive_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source TEXT NOT NULL DEFAULT 'cron',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // sms_logs 테이블도 없으면 생성
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

    // phone_verification_codes 테이블도 없으면 생성
    await client`
      CREATE TABLE IF NOT EXISTS phone_verification_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // keepalive 기록 삽입
    await db.insert(keepaliveLogs).values({ source: 'cron' });

    // 최근 핑 시간 조회
    const [latest] = await db
      .select()
      .from(keepaliveLogs)
      .orderBy(desc(keepaliveLogs.createdAt))
      .limit(1);

    return NextResponse.json({
      ok: true,
      pingedAt: latest?.createdAt?.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[keepalive] DB error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
