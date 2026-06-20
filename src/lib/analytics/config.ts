/**
 * GA4 설정. Measurement ID는 환경변수에서 주입한다.
 * 미설정 시 모든 트래킹은 no-op으로 동작하여 개발 환경을 오염시키지 않는다.
 */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

export const isGAEnabled = GA_MEASUREMENT_ID.startsWith('G-');

/**
 * Google Tag Manager 컨테이너 ID. 환경변수로 오버라이드 가능, 미설정 시 명동점 기본 컨테이너 사용.
 */
export const GTM_CONTAINER_ID =
  process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-W8S89SXG';

export const isGTMEnabled = GTM_CONTAINER_ID.startsWith('GTM-');

/** 스크롤 깊이 이벤트 발화 지점 (%) */
export const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;
