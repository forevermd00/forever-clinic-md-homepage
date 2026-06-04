'use client';

/**
 * GA4 이벤트 전송 헬퍼.
 * `@next/third-parties`의 GoogleAnalytics 컴포넌트가 주입한 window.gtag를 사용한다.
 * gtag 미존재(= Measurement ID 미설정 또는 SSR) 시 안전하게 no-op.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type GaEventParams = Record<string, unknown>;

/** GA4 커스텀 이벤트 명세. 리포트에서 이 이름으로 집계된다. */
export type GaEventName =
  | 'button_click' // 일반 버튼/요소 클릭
  | 'nav_click' // 헤더/푸터 네비게이션 클릭
  | 'tel_click' // 전화 걸기 (tel:)
  | 'email_click' // 이메일 (mailto:)
  | 'messenger_click' // 카카오/위챗/LINE/WhatsApp 등 메신저
  | 'outbound_click' // 외부 도메인 링크
  | 'form_submit' // 폼 제출 (예약/문의)
  | 'scroll_depth'; // 스크롤 깊이 (25/50/75/100%)

export function trackEvent(
  name: GaEventName | string,
  params: GaEventParams = {},
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function')
    return;
  // undefined 값은 GA4에서 잡음이 되므로 제거
  const clean: GaEventParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') clean[k] = v;
  }
  window.gtag('event', name, clean);
}

/** 폼 제출 전환 이벤트 (예약/상담 문의 등) */
export function trackFormSubmit(
  formId: string,
  params: GaEventParams = {},
): void {
  trackEvent('form_submit', { ga_id: formId, ...params });
}
