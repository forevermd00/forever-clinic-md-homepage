import type { SectionVisibility } from '@/lib/data/visibility';

const MEDIA_TAB_ORDER = ['press', 'video', 'blog', 'notice'] as const;
type MediaTab = (typeof MEDIA_TAB_ORDER)[number];

/**
 * Returns the first visible media tab path, or null if all are hidden.
 */
export function getFirstVisibleMediaTab(
  mediaVisibility: SectionVisibility['media'],
): MediaTab | null {
  return MEDIA_TAB_ORDER.find((tab) => mediaVisibility[tab] !== false) ?? null;
}
