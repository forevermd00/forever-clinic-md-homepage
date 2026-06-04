/**
 * 클릭된 요소로부터 안정적인 GA 식별자를 도출한다.
 *
 * 우선순위:
 *   1. data-ga-id (명시적 — 가장 권장)
 *   2. 요소의 id
 *   3. 내부 링크: `link:{언어코드 제거한 경로}`  (언어 무관 안정)
 *   4. tel:/mailto:/외부 링크: href 자체 (이미 안정적)
 *   5. 순수 버튼: `{섹션}__btn{섹션 내 순번}` (텍스트 비의존 → 언어 무관 안정)
 *
 * 핵심: 폴백 ID가 화면 텍스트(언어별로 다름)에 의존하지 않으므로,
 * 명시적 ID가 없는 버튼도 ko/en/zh/ja에서 동일한 ID로 집계된다.
 * 화면 텍스트는 link_text 파라미터로 별도 전송(리포트 가독성용).
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

export interface DerivedClick {
  gaId: string;
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

  // 가장 가까운 섹션 식별자 (data-ga-section 우선)
  const section =
    target.closest<HTMLElement>('[data-ga-section]')?.dataset.gaSection ??
    target.closest<HTMLElement>('section[id], [id][role="region"]')?.id ??
    'page';

  // ---- 식별자 도출 (우선순위 순) ----
  let gaId = dataNode.dataset.gaId ?? '';

  if (!gaId && target.id) gaId = target.id;

  if (!gaId && href) {
    if (/^(tel:|mailto:)/i.test(href)) {
      gaId = href;
    } else if (/^https?:\/\//i.test(href)) {
      try {
        const url = new URL(href);
        gaId =
          url.host === window.location.host
            ? `link:${stripLocale(url.pathname)}`
            : `ext:${url.host}`;
      } catch {
        gaId = `ext:${slugify(href)}`;
      }
    } else if (href.startsWith('/')) {
      gaId = `link:${stripLocale(href)}`;
    } else if (href.startsWith('#')) {
      gaId = `${section}__anchor-${slugify(href)}`;
    }
  }

  if (!gaId) {
    // 순수 버튼: 섹션 내 인터랙티브 요소 순번으로 안정 식별
    const container =
      target.closest<HTMLElement>(
        '[data-ga-section], section, [role="dialog"]',
      ) ?? document.body;
    const all = Array.from(
      container.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR),
    );
    const idx = all.indexOf(target);
    const tag = target.tagName.toLowerCase();
    gaId = `${section}__${tag}${idx >= 0 ? idx : ''}`;
  }

  return {
    gaId,
    text,
    href,
    eventOverride: dataNode.dataset.gaEvent,
    extraParams,
  };
}
