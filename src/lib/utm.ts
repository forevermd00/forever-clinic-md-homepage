/**
 * UTM/유입 출처 캡처·보존·주입 유틸 (클라이언트 전용).
 *
 * - 랜딩 시 URL의 utm_* / src 파라미터를 캡처해 localStorage에 timestamp와 함께 저장
 * - 새 UTM이 들어오면 overwrite (last-touch)
 * - 캡처 후 URL에서는 utm 파라미터 제거 (화면 전환 시 클린 URL)
 * - 예약 제출 시 etcReservationFrom 문자열로 주입하고 clear
 *
 * 장바구니(zustand persist, localStorage 'forever-clinic-cart')와 동일하게 localStorage 사용.
 */

const STORAGE_KEY = 'forever-clinic-utm';

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'src',
] as const;

export interface StoredUtm {
  params: Record<string, string>;
  ts: number; // 캡처 시각 (epoch ms)
}

/** URLSearchParams에서 utm 파라미터만 추출 */
function extractUtm(search: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const v = search.get(key);
    if (v && v.trim()) out[key] = v.trim().slice(0, 120);
  }
  return out;
}

export function getStoredUtm(): StoredUtm | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUtm;
    if (parsed && parsed.params && typeof parsed.ts === 'number') return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearStoredUtm(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/** etcReservationFrom 으로 보낼 문자열 (예: "utm_source=ad;utm_content=d"). 없으면 undefined */
export function buildAttribution(): string | undefined {
  const stored = getStoredUtm();
  if (!stored) return undefined;
  const entries = Object.entries(stored.params);
  if (entries.length === 0) return undefined;
  return entries
    .map(([k, v]) => `${k}=${v}`)
    .join(';')
    .slice(0, 200);
}

/**
 * 현재 URL의 search 문자열에서 UTM을 캡처해 저장(overwrite)한다.
 * @returns 캡처된 경우 utm을 제거한 search 문자열(없으면 ''), 캡처 안 된 경우 null
 */
export function captureUtmFromSearch(searchStr: string): string | null {
  if (typeof window === 'undefined') return null;
  const search = new URLSearchParams(searchStr);
  const utm = extractUtm(search);
  if (Object.keys(utm).length === 0) return null;

  // overwrite (timestamp 갱신)
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ params: utm, ts: Date.now() } satisfies StoredUtm),
    );
  } catch {
    /* noop */
  }

  // URL에서 utm 파라미터 제거
  for (const key of UTM_KEYS) search.delete(key);
  return search.toString();
}
