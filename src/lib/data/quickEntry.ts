import { sanityFetch } from '@/lib/sanity/fetch';
import { quickEntryAllCardsQuery } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';

interface SanityLinkedTreatment {
  slug: string;
  category: string;
}

interface SanityQuickEntryCard {
  _id: string;
  title?: string;
  description?: string;
  tabRef?: string;
  tabKey?: string;
  tabLabel?: string;
  tabSort?: number;
  tabVisible?: boolean;
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

export interface QuickEntryTab {
  id: string;
  key: string;
  label: string;
}

function deriveLinkUrl(
  cardSlug?: string,
  linked?: SanityLinkedTreatment[],
): string {
  if (cardSlug) return `/treatments/${cardSlug}`;
  if (!linked || linked.length === 0) return '/treatments';
  if (linked.length === 1) {
    return `/treatments/${linked[0].category}/${linked[0].slug}`;
  }
  const categories = [...new Set(linked.map((t) => t.category))];
  if (categories.length === 1) return `/treatments?cat=${categories[0]}`;
  return '/treatments';
}

export interface QuickEntryData {
  tabs: QuickEntryTab[];
  cardsByTab: Record<string, QuickEntryCard[]>;
}

export async function getQuickEntryData(
  locale: string,
): Promise<QuickEntryData> {
  const data = await sanityFetch<SanityQuickEntryCard[]>(
    quickEntryAllCardsQuery,
    { locale },
  );

  if (!data || data.length === 0) return { tabs: [], cardsByTab: {} };

  // 카드에서 탭 정보를 추출해 탭 목록을 직접 구성
  // key: tabRef (reference 방식) 또는 tabKey (string 방식)
  const tabMap = new Map<
    string,
    {
      id: string;
      key: string;
      label: string;
      sort: number;
      cards: QuickEntryCard[];
    }
  >();

  for (const card of data) {
    // 그룹핑 키: tabRef(document _id) 우선, 없으면 tabKey(string)
    const groupKey = card.tabRef ?? card.tabKey;
    if (!groupKey) continue;

    if (!tabMap.has(groupKey)) {
      tabMap.set(groupKey, {
        id: groupKey,
        key: card.tabKey ?? groupKey,
        label: card.tabLabel ?? card.tabKey ?? groupKey,
        sort: card.tabSort ?? 999,
        cards: [],
      });
    }

    tabMap.get(groupKey)!.cards.push({
      id: card._id,
      title: card.title || '',
      description: card.description || '',
      image: card.icon
        ? urlFor(card.icon)?.width(400).height(300).url() || ''
        : '',
      linkUrl: deriveLinkUrl(card.cardSlug, card.linkedTreatments),
    });
  }

  // sortOrder 기준 정렬
  const sortedTabs = [...tabMap.values()].sort((a, b) => a.sort - b.sort);

  const tabs: QuickEntryTab[] = sortedTabs.map((t) => ({
    id: t.id,
    key: t.key,
    label: t.label,
  }));

  const cardsByTab: Record<string, QuickEntryCard[]> = {};
  for (const t of sortedTabs) {
    cardsByTab[t.id] = t.cards;
  }

  return { tabs, cardsByTab };
}

// 하위 호환 유지
export async function getQuickEntryTabs(
  locale: string,
): Promise<QuickEntryTab[]> {
  const { tabs } = await getQuickEntryData(locale);
  return tabs;
}

export async function getQuickEntryCardsByTab(
  locale: string,
): Promise<Record<string, QuickEntryCard[]>> {
  const { cardsByTab } = await getQuickEntryData(locale);
  return cardsByTab;
}
