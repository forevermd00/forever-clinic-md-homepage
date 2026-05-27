import type { SectionVisibility } from '@/lib/data/visibility';

const DEFAULT_MEDIA_TAB_ORDER = ['press', 'video', 'blog', 'notice'] as const;
type MediaTab = (typeof DEFAULT_MEDIA_TAB_ORDER)[number];

function resolveTabOrder(mediaOrder?: string[] | null): MediaTab[] {
  if (!mediaOrder?.length) return [...DEFAULT_MEDIA_TAB_ORDER];
  return [
    ...mediaOrder.filter((k): k is MediaTab =>
      DEFAULT_MEDIA_TAB_ORDER.includes(k as MediaTab),
    ),
    ...DEFAULT_MEDIA_TAB_ORDER.filter((k) => !mediaOrder.includes(k)),
  ];
}

export function getFirstVisibleMediaTab(
  mediaVisibility: SectionVisibility['media'],
  mediaOrder?: string[] | null,
): MediaTab | null {
  return (
    resolveTabOrder(mediaOrder).find((tab) => mediaVisibility[tab] !== false) ??
    null
  );
}

export { resolveTabOrder };
