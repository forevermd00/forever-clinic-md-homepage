import { sanityFetch } from '@/lib/sanity/fetch';
import {
  quickEntryAllCardsQuery,
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
  tabKey?: string;
  cardSlug?: string;
  icon?: { asset?: { _ref: string } };
  linkedTreatments?: SanityLinkedTreatment[];
}

export interface QuickEntryCard {
  id: string;
  title: string;
  description: string;
  image: string;
  linkUrl: string;
}

function deriveLinkUrl(
  cardSlug?: string,
  linked?: SanityLinkedTreatment[],
): string {
  if (cardSlug) return `/quick-entry/${cardSlug}`;
  if (!linked || linked.length === 0) return '/treatments';
  if (linked.length === 1) {
    return `/treatments/${linked[0].category}/${linked[0].slug}`;
  }
  const categories = [...new Set(linked.map((t) => t.category))];
  if (categories.length === 1) return `/treatments?cat=${categories[0]}`;
  return '/treatments';
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

export async function getQuickEntryCardsByTab(
  locale: string,
): Promise<Record<string, QuickEntryCard[]>> {
  const data = await sanityFetch<SanityQuickEntryCard[]>(
    quickEntryAllCardsQuery,
    { locale },
  );
  if (!data || data.length === 0) return {};

  const result: Record<string, QuickEntryCard[]> = {};
  for (const card of data) {
    const key = card.tabKey;
    if (!key) continue;
    if (!result[key]) result[key] = [];
    result[key].push({
      id: card._id,
      title: card.title || '',
      description: card.description || '',
      image: card.icon
        ? urlFor(card.icon)?.width(400).height(300).url() || ''
        : '',
      linkUrl: deriveLinkUrl(card.cardSlug, card.linkedTreatments),
    });
  }
  return result;
}
