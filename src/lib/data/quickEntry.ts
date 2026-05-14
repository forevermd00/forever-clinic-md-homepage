import { sanityFetch } from '@/lib/sanity/fetch';
import {
  quickEntryCardsQuery,
  quickEntryTabsQuery,
} from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';

interface SanityLinkedTreatment {
  slug: string;
  category: string;
}

interface SanityQuickEntryCard {
  _id: string;
  title?: string;
  description?: string;
  icon?: { asset?: { _ref: string } };
  linkUrl?: string;
  linkedTreatments?: SanityLinkedTreatment[];
}

export interface QuickEntryCard {
  id: string;
  title: string;
  description: string;
  image: string;
  linkUrl: string;
}

/**
 * linkedTreatments에서 linkUrl 도출
 * - 시술 1개       → /treatments/{category}/{slug}
 * - 동일 카테고리  → /treatments?cat={category}
 * - 복수 카테고리  → /treatments
 */
function deriveLinkUrl(linked?: SanityLinkedTreatment[]): string {
  if (!linked || linked.length === 0) return '/treatments';
  if (linked.length === 1) {
    return `/treatments/${linked[0].category}/${linked[0].slug}`;
  }
  const categories = [...new Set(linked.map((t) => t.category))];
  if (categories.length === 1) {
    return `/treatments?cat=${categories[0]}`;
  }
  return '/treatments';
}

function mapToPageShape(
  data: SanityQuickEntryCard[],
  _locale: string,
): QuickEntryCard[] {
  return data.map((card) => ({
    id: card._id,
    title: card.title || '',
    description: card.description || '',
    image: card.icon
      ? urlFor(card.icon)?.width(400).height(300).url() || ''
      : '',
    linkUrl: card.linkUrl || deriveLinkUrl(card.linkedTreatments),
  }));
}

export interface QuickEntryTab {
  id: string;
  key: string;
  label: string;
}

interface SanityQuickEntryTab {
  _id: string;
  key?: string;
  label?: string;
}

export async function getQuickEntryTabs(
  locale: string,
): Promise<QuickEntryTab[]> {
  const data = await sanityFetch<SanityQuickEntryTab[]>(quickEntryTabsQuery, {
    locale,
  });
  if (!data || data.length === 0) return [];
  return data.map((t) => ({
    id: t._id,
    key: t.key ?? '',
    label: t.label ?? '',
  }));
}

export async function getQuickEntryCards(
  tab: string,
  locale: string,
): Promise<QuickEntryCard[]> {
  const data = await sanityFetch<SanityQuickEntryCard[]>(quickEntryCardsQuery, {
    tab,
    locale,
  });

  if (data && data.length > 0) return mapToPageShape(data, locale);
  return [];
}
