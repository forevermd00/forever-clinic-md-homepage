import { sanityFetch } from '@/lib/sanity/fetch';
import { quickEntryCardsQuery } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';

interface SanityQuickEntryCard {
  _id: string;
  title?: string;
  description?: string;
  icon?: { asset?: { _ref: string } };
  linkUrl?: string;
}

interface QuickEntryCard {
  id: string;
  title: string;
  description: string;
  image: string;
  linkUrl: string;
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
      ? urlFor(card.icon)?.width(200).height(200).url() || ''
      : '',
    linkUrl: card.linkUrl || '/treatments',
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
