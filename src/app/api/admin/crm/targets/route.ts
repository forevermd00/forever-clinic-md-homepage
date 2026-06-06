import { NextResponse } from 'next/server';
import { listReservationTargets, isCrmConfigured } from '@/lib/crm/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 예약 등록 가능한 진료과목/부서/담당의 조합 조회.
 * Studio "설정 > CRM 연동" 탭의 부서·담당의 선택용.
 * (geocode 라우트와 동일하게 Studio 내부 호출 전제 — 토큰은 서버에만 보관)
 */
export async function GET() {
  if (!isCrmConfigured()) {
    return NextResponse.json(
      { error: 'SMARTDOCTOR_API_TOKEN 미설정' },
      { status: 503 },
    );
  }
  try {
    const departments = await listReservationTargets();
    return NextResponse.json({ departments });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
