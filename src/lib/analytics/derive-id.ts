/**
 * 클릭된 요소로부터 안정적인 GA 식별자를 도출한다.
 * 우선순위: data-ga-id > 요소 id > (가장 가까운 섹션) + (접근성 텍스트/라벨)
 *
 * 이로써 명시적 ID를 부여하지 않은 버튼도 자동으로 식별되어
 * "어떤 버튼을 눌렀는지"가 100% 수집된다.
 */

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
  /** data-ga-* 추가 파라미터 */
  extraParams: Record<string, string>;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-ga-id], input[type="submit"], input[type="button"]';

export function deriveClickTarget(start: HTMLElement): DerivedClick | null {
  const target = start.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  if (!target) return null;

  // data-ga-* 커스텀 속성 수집
  const dataNode =
    target.closest<HTMLElement>('[data-ga-id], [data-ga-event]') ?? target;
  const extraParams: Record<string, string> = {};
  for (const attr of Array.from(dataNode.attributes)) {
    // data-ga-foo → foo (ga_id / ga_event 는 별도 처리)
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

  // 식별자 도출
  let gaId = dataNode.dataset.gaId ?? '';
  if (!gaId && target.id) gaId = target.id;
  if (!gaId) {
    const section =
      target.closest<HTMLElement>('[data-ga-section]')?.dataset.gaSection ??
      target.closest<HTMLElement>('section[id], [id][role="region"]')?.id ??
      'page';
    const label = slugify(text) || target.tagName.toLowerCase();
    gaId = `${section}__${label}`;
  }

  return {
    gaId,
    text,
    href,
    eventOverride: dataNode.dataset.gaEvent,
    extraParams,
  };
}
