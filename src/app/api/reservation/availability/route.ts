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
 * 홈페이지 예약 폼의 시간 슬롯 가용 여부 조회.
 * 슬롯당 최대 예약 수(한도)는 CRM의 `reservationTimeSlots`(부서 슬롯별 최대 예약 수)에서
 * 가져오고, 현재 예약 수는 `reservationCounts`에서 가져와 한도 이상이면 마감 처리한다.
 *
 * GET /api/reservation/availability?date=YYYY-MM-DD
 * → { enabled: boolean, limit: number, blockedSlots: ["14:00", ...], counts: {"14:00": 2} }
 */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? '';
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: 'invalid date' }, { status: 400 });
  }

  const settings = await getCrmSettings();
  const noBlock = {
    enabled: false,
    limit: 0,
    blockedSlots: [] as string[],
    counts: {} as Record<string, number>,
  };

  // 토큰/부서 미설정 → 블락 없음
  if (!isCrmConfigured() || !settings.departmentCode) {
    return NextResponse.json(noBlock);
  }

  try {
    const dept = settings.departmentCode;
    const [slots, counts] = await Promise.all([
      getDepartmentTimeSlots([dept]),
      getReservationCounts({ reservationDate: date, departmentCodes: [dept] }),
    ]);

    const limit =
      slots.find((s) => s.departmentCode === dept)?.timeSlotLimit ??
      slots[0]?.timeSlotLimit ??
      0;

    // CRM에 한도 설정이 없으면(0 이하) 블락하지 않음
    if (!limit || limit <= 0) {
      return NextResponse.json(noBlock);
    }

    const countMap: Record<string, number> = {};
    for (const c of counts) {
      const t = c.reservationTime.slice(0, 5); // "HH:mm:ss" → "HH:mm"
      countMap[t] = (countMap[t] ?? 0) + c.count;
    }
    const blocked = Object.entries(countMap)
      .filter(([, n]) => n >= limit)
      .map(([t]) => t);

    return NextResponse.json({
      enabled: true,
      limit,
      blockedSlots: blocked,
      counts: countMap,
    });
  } catch (e) {
    // CRM 조회 실패 시 폼을 막지 않도록 블락 없음으로 응답 (안전 폴백)
    console.error('[availability] CRM 조회 실패:', e);
    return NextResponse.json({ ...noBlock, error: 'lookup_failed' });
  }
}
