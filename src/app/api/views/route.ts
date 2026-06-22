import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2026-04-25',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  try {
    // views 필드가 없는 문서(예: 새 블로그 글)는 inc 만으로는 에러가 나므로
    // setIfMissing 으로 0 초기화 후 증가
    await writeClient
      .patch(id)
      .setIfMissing({ views: 0 })
      .inc({ views: 1 })
      .commit();
    return NextResponse.json(
      { ok: true },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
