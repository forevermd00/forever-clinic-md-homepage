/**
 * GA4 설정. Measurement ID는 환경변수에서 주입한다.
 * 미설정 시 모든 트래킹은 no-op으로 동작하여 개발 환경을 오염시키지 않는다.
 */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

export const isGAEnabled = GA_MEASUREMENT_ID.startsWith('G-');

/** 스크롤 깊이 이벤트 발화 지점 (%) */
export const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;
