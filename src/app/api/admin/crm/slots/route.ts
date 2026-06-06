import { NextRequest, NextResponse } from 'next/server';
import { getCrmSettings } from '@/lib/crm/settings';
import {
  getReservationCounts,
  getDepartmentTimeSlots,
  isCrmConfigured,
} from '@/lib/crm/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 관리자 페이지(Studio CRM 연동 탭)용 — 특정 날짜의 부서 예약 현황 조회.
 * 시간대별 현재 예약 수(reservationCounts) + 부서 슬롯 한도(reservationTimeSlots)를 반환.
 *
 * GET /api/admin/crm/slots?date=YYYY-MM-DD
 */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? '';
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: 'invalid date' }, { status: 400 });
  }
  if (!isCrmConfigured()) {
    return NextResponse.json(
      { error: 'SMARTDOCTOR_API_TOKEN 미설정' },
      { status: 503 },
    );
  }

  const settings = await getCrmSettings();
  if (!settings.departmentCode) {
    return NextResponse.json(
      { error: '부서가 설정되지 않았습니다. 먼저 부서를 선택해 주세요.' },
      { status: 400 },
    );
  }

  const dept = settings.departmentCode;
  try {
    const [slots, counts] = await Promise.all([
      getDepartmentTimeSlots([dept]),
      getReservationCounts({ reservationDate: date, departmentCodes: [dept] }),
    ]);
    const limit =
      slots.find((s) => s.departmentCode === dept)?.timeSlotLimit ??
      slots[0]?.timeSlotLimit ??
      0;
    const rows = counts
      .map((c) => ({ time: c.reservationTime.slice(0, 5), count: c.count }))
      .sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      date,
      departmentCode: dept,
      departmentName: settings.departmentName,
      limit,
      rows,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
