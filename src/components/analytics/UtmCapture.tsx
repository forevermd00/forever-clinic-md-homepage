'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureUtmFromSearch } from '@/lib/utm';

/**
 * UTM 캡처기. 레이아웃에 1회 마운트.
 * - 진입/화면 전환 시 URL의 utm_* / src 를 캡처해 localStorage(timestamp 동반)에 저장(overwrite)
 * - 캡처 후 URL에서 utm 파라미터를 제거 (history.replaceState — 리렌더 없이 클린 URL)
 * - 시각적 출력 없음
 */
export function UtmCapture() {
  const pathname = usePathname();

  useEffect(() => {
    const cleaned = captureUtmFromSearch(window.location.search);
    if (cleaned !== null) {
      const url =
        window.location.pathname +
        (cleaned ? `?${cleaned}` : '') +
        window.location.hash;
      window.history.replaceState(null, '', url);
    }
  }, [pathname]);

  return null;
}
