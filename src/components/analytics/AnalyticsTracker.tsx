'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/events';
import { deriveClickTarget } from '@/lib/analytics/derive-id';
import { SCROLL_DEPTH_THRESHOLDS } from '@/lib/analytics/config';

/**
 * 전역 행동 트래커.
 * - 위임(delegated) 클릭 리스너: 모든 버튼/링크 클릭을 자동 식별하여 GA4로 전송.
 *   (페이지뷰 / 유입 출처는 GoogleAnalytics 컴포넌트가 자동 수집)
 * - 스크롤 깊이: 25/50/75/100% 도달 시 1회씩 전송 (라우트 변경 시 리셋).
 *
 * 별도의 시각적 출력 없음. 레이아웃에 1회 마운트.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  // ---- 클릭 위임 추적 (마운트 1회) ----
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const start = e.target as HTMLElement | null;
      if (!start) return;
      const click = deriveClickTarget(start);
      if (!click) return;

      const { gaId, section, text, href, eventOverride, extraParams } = click;
      const base = {
        ga_id: gaId,
        ga_section: section,
        link_text: text,
        link_url: href,
        page_path: window.location.pathname,
        ...extraParams,
      };

      // 명시적 이벤트 오버라이드(data-ga-event) 최우선
      if (eventOverride) {
        trackEvent(eventOverride, base);
        return;
      }

      const host = window.location.host;
      if (href.startsWith('tel:')) {
        trackEvent('tel_click', {
          ...base,
          phone_number: href.replace('tel:', ''),
        });
      } else if (href.startsWith('mailto:')) {
        trackEvent('email_click', base);
      } else if (/^https?:\/\//i.test(href) && !href.includes(host)) {
        trackEvent('outbound_click', base);
      } else {
        trackEvent('button_click', base);
      }
    };

    // capture 단계: stopPropagation 되는 클릭도 포착
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // ---- 스크롤 깊이 추적 (라우트별 리셋) ----
  const firedRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    firedRef.current = new Set();
    let ticking = false;

    const measure = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      const percent = (window.scrollY / scrollable) * 100;
      for (const t of SCROLL_DEPTH_THRESHOLDS) {
        if (percent >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t);
          trackEvent('scroll_depth', {
            percent: t,
            page_path: window.location.pathname,
          });
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    measure(); // 초기 진입 시 짧은 페이지(100%) 즉시 반영
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // ---- 섹션 노출 추적 (라우트별 리셋) ----
  // data-ga-section 을 가진 요소가 화면에 50% 이상 노출되면 section_view 1회 발화.
  // "어떤 섹션까지 실제로 봤는지"를 스크롤 깊이(%)보다 정밀하게 기록.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const name = el.dataset.gaSection;
          if (!name || seen.has(name)) continue;
          seen.add(name);
          trackEvent('section_view', {
            ga_section: name,
            page_path: window.location.pathname,
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );
    // 라우트 전환 후 DOM 반영을 기다렸다가 관찰 시작
    const raf = window.requestAnimationFrame(() => {
      document
        .querySelectorAll<HTMLElement>('[data-ga-section]')
        .forEach((el) => observer.observe(el));
    });
    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
