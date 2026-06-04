/**
 * 클릭된 요소로부터 GA 식별자(ga_id)와 섹션(ga_section)을 도출한다.
 * 규칙 단일 기준점: docs/analytics-tracking.md
 *
 * ga_id 포맷: `{section}.{element}` (점 1개로 섹션/엘리먼트 분리)
 *
 * gaId 우선순위:
 *   1. data-ga-id (명시적 — 권장)
 *   2. 요소의 id
 *   3. 폴백: `{section}.{element}` 자동 생성 (화면 텍스트 비의존 → 언어 무관 안정)
 *      - 내부 링크:  {section}.link-{언어코드 제거 경로}
 *      - 외부 링크:  {section}.ext-{host}
 *      - tel/mailto: {section}.tel / {section}.email
 *      - 해시:       {section}.anchor-{해시}
 *      - 순수 버튼:  {section}.{tag}-{섹션 내 순번}
 *
 * section: 가장 가까운 data-ga-section → 없으면 경로 기반 routeScope.
 */

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-ga-id], input[type="submit"], input[type="button"]';

const LOCALE_RE = /^\/(ko|en|zh|ja)(?=\/|$)/;

function stripLocale(path: string): string {
  const stripped = path.replace(LOCALE_RE, '');
  return stripped === '' ? '/' : stripped;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣_-]/g, '')
    .slice(0, 60);
}

/** 경로 → 논리적 페이지 스코프 (섹션 폴백용) */
function routeScope(pathname: string): string {
  const segs = stripLocale(pathname).split('/').filter(Boolean);
  if (segs.length === 0) return 'home';
  const s0 = segs[0];
  switch (s0) {
    case 'treatments':
      return segs.length >= 3 ? 'treatment-detail' : 'treatments';
    case 'before-after':
      return 'ba';
    case 'media':
      return 'media';
    case 'brand':
      return 'brand';
    case 'estimate':
      return 'estimate';
    case 'contact':
      return 'contact';
    case 'auth':
      return segs[1] ? `auth-${segs[1]}` : 'auth';
    default:
      return s0;
  }
}

export interface DerivedClick {
  gaId: string;
  section: string;
  text: string;
  href: string;
  /** data-ga-event 속성으로 지정된 이벤트명 오버라이드 (있을 경우) */
  eventOverride?: string;
  /** data-ga-* 추가 파라미터 (ga_id / ga_event 제외) */
  extraParams: Record<string, string>;
}

export function deriveClickTarget(start: HTMLElement): DerivedClick | null {
  const target = start.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  if (!target) return null;

  // data-ga-* 커스텀 속성 수집
  const dataNode =
    target.closest<HTMLElement>('[data-ga-id], [data-ga-event]') ?? target;
  const extraParams: Record<string, string> = {};
  for (const attr of Array.from(dataNode.attributes)) {
    if (
      attr.name.startsWith('data-ga-') &&
      attr.name !== 'data-ga-id' &&
      attr.name !== 'data-ga-event'
    ) {
      extraParams[attr.name.replace('data-ga-', 'ga_')] = attr.value;
    }
  }

  const aria =
    target.getAttribute('aria-label') ?? target.getAttribute('title') ?? '';
  const text = (aria || target.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);

  const anchor = target.closest('a');
  const href =
    anchor?.getAttribute('href') ?? target.getAttribute('href') ?? '';

  // 섹션: 가장 가까운 data-ga-section → 경로 기반 폴백
  const section =
    target.closest<HTMLElement>('[data-ga-section]')?.dataset.gaSection ??
    routeScope(window.location.pathname);

  // ---- ga_id 도출 (우선순위 순) ----
  let gaId = dataNode.dataset.gaId ?? '';

  if (!gaId && target.id) gaId = target.id;

  if (!gaId) {
    let element: string;
    if (href && /^(tel:)/i.test(href)) {
      element = 'tel';
    } else if (href && /^(mailto:)/i.test(href)) {
      element = 'email';
    } else if (href && /^https?:\/\//i.test(href)) {
      try {
        const url = new URL(href);
        element =
          url.host === window.location.host
            ? `link-${stripLocale(url.pathname)}`
            : `ext-${url.host}`;
      } catch {
        element = `ext-${slugify(href)}`;
      }
    } else if (href && href.startsWith('/')) {
      element = `link-${stripLocale(href)}`;
    } else if (href && href.startsWith('#')) {
      element = `anchor-${slugify(href)}`;
    } else {
      // 순수 버튼: 섹션 내 인터랙티브 요소 순번으로 안정 식별
      const container =
        target.closest<HTMLElement>(
          '[data-ga-section], section, [role="dialog"]',
        ) ?? document.body;
      const all = Array.from(
        container.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR),
      );
      const idx = all.indexOf(target);
      element = `${target.tagName.toLowerCase()}-${idx >= 0 ? idx : 0}`;
    }
    gaId = `${section}.${element}`;
  }

  return {
    gaId,
    section,
    text,
    href,
    eventOverride: dataNode.dataset.gaEvent,
    extraParams,
  };
}
