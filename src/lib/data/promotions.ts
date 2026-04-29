import { sanityFetch } from '@/lib/sanity/fetch';
import { promotionsQuery } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';

/* ─── Sanity raw shape ─── */

interface SanityPromotion {
  _id: string;
  title?: string;
  image?: unknown;
  description?: string;
  eventPrice?: number;
  startDate?: string;
  endDate?: string;
  showOnMain?: boolean;
  treatment?: {
    name?: string;
    slug?: string;
    priceOptions?: { label?: string; price?: number; discountPrice?: number }[];
  };
}

/* ─── Types ─── */

export type Promotion = {
  id: string;
  slug: string;
  image?: { src: string; alt: string };
  badge: string;
  title: string;
  description: string;
  date: string;
  originalPrice?: string;
  discountedPrice: string;
};

/* ─── Mapping helpers ─── */

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function mapPromotions(raw: SanityPromotion[]): Promotion[] {
  return raw.map((p) => {
    const originalPrice = p.treatment?.priceOptions?.[0]?.price;
    const dateRange =
      p.startDate && p.endDate
        ? `${formatDate(p.startDate)} ~ ${formatDate(p.endDate)}`
        : '';

    return {
      id: p._id,
      slug: p.treatment?.slug || p._id,
      image: p.image
        ? {
            src: urlFor(p.image)?.width(800).height(400).url() || '',
            alt: p.title || '',
          }
        : undefined,
      badge: 'EVENT',
      title: p.title || '',
      description: p.description || '',
      date: dateRange,
      originalPrice: originalPrice
        ? `₩${originalPrice.toLocaleString()}`
        : undefined,
      discountedPrice: p.eventPrice ? `₩${p.eventPrice.toLocaleString()}` : '',
    };
  });
}

/* ─── Fetch Functions ─── */

export async function getPromotions(locale: string): Promise<Promotion[]> {
  const data = await sanityFetch<SanityPromotion[]>(promotionsQuery, {
    locale,
  });

  if (!data || data.length === 0) return [];

  return mapPromotions(data);
}
