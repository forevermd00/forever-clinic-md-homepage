import { sanityFetch } from '@/lib/sanity/fetch';
import {
  treatmentsByCategoryQuery,
  treatmentDetailQuery,
  allTreatmentsGroupedQuery,
  homeEventTreatmentsQuery,
} from '@/lib/sanity/queries';

// Sanity에서 string 또는 localizedString 객체 모두 처리
function extractLocale(field: unknown, locale: string): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    const f = field as Record<string, unknown>;
    return String(f[locale] ?? f['ko'] ?? '');
  }
  return '';
}
import {
  TREATMENT_CATEGORIES,
  getCategoryBySlug,
  type TreatmentCategory,
} from '@/components/treatments/treatmentData';

/* ─── Sanity raw shape (what GROQ returns) ─── */

interface SanityTreatment {
  _id: string;
  name?: Record<string, string>;
  slug?: { current: string };
  category?: string;
  tagline?: Record<string, string>;
  keywords?: Record<string, string>;
  description?: Record<string, string>;
  composition?: Record<string, string>;
  priceOptions?: {
    label?: string;
    price?: number;
    discountPrice?: number;
    name?: Record<string, string>;
  }[];
  isEvent?: boolean;
  isSignature?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
  duration?: string;
  downtime?: string;
  treatmentTime?: string;
  imageUrl?: string;
}

export async function getTreatmentsByCategory(
  category: string,
  locale: string,
): Promise<TreatmentCategory | undefined> {
  const fallback = getCategoryBySlug(category);

  const treatments = await sanityFetch<SanityTreatment[]>(
    treatmentsByCategoryQuery,
    { category },
  );

  if (!treatments || treatments.length === 0) return fallback;

  const categoryMeta = TREATMENT_CATEGORIES.find((c) => c.slug === category);

  return {
    slug: category,
    label: categoryMeta?.label || category,
    labelEn: categoryMeta?.labelEn || category,
    description: categoryMeta?.description || '',
    bgColor: categoryMeta?.bgColor || 'bg-white',
    treatments: treatments.map((t) => ({
      name: t.name?.[locale] || t.name?.ko || '',
      slug: t.slug?.current || '',
      category,
      price: t.priceOptions?.[0]
        ? `₩${t.priceOptions[0].price?.toLocaleString()}~`
        : '',
      priceNumeric: t.priceOptions?.[0]?.price || 0,
      hasEvent: t.isEvent || false,
      description: t.tagline?.[locale] || t.tagline?.ko || '',
      duration: extractLocale(t.treatmentTime, locale),
      anesthesia: '',
      recovery: extractLocale(t.downtime, locale),
      recommended: t.duration || '',
      imageUrl: t.imageUrl,
    })),
  };
}

export async function getTreatmentDetail(slug: string, locale: string) {
  return sanityFetch(treatmentDetailQuery, { slug, locale });
}

export type EventTreatment = {
  _id: string;
  name: string;
  tagline: string;
  price: string;
  imageUrl?: string;
};

export async function getEventTreatments(
  locale: string,
): Promise<EventTreatment[]> {
  const raw = await sanityFetch<
    {
      _id: string;
      name?: Record<string, string>;
      tagline?: Record<string, string>;
      priceOptions?: { price?: number; discountPrice?: number }[];
      imageUrl?: string;
    }[]
  >(homeEventTreatmentsQuery, {});

  if (!raw || raw.length === 0) return [];

  return raw.map((t) => {
    const firstPrice = t.priceOptions?.[0];
    const effectivePrice = firstPrice?.discountPrice ?? firstPrice?.price;
    return {
      _id: t._id,
      name: t.name?.[locale] || t.name?.ko || '',
      tagline: t.tagline?.[locale] || t.tagline?.ko || '',
      price: effectivePrice ? `₩${effectivePrice.toLocaleString()}` : '',
      imageUrl: t.imageUrl,
    };
  });
}

export async function getAllCategories(
  locale: string,
): Promise<TreatmentCategory[]> {
  const raw = await sanityFetch<SanityTreatment[]>(
    allTreatmentsGroupedQuery,
    {},
  );

  if (!raw || raw.length === 0) return TREATMENT_CATEGORIES;

  // Sanity 데이터를 카테고리별로 그룹핑
  const grouped: Record<string, SanityTreatment[]> = {};
  for (const t of raw) {
    const cat = t.category || '';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  }

  return TREATMENT_CATEGORIES.map((catMeta) => {
    const items = grouped[catMeta.slug];
    if (!items || items.length === 0) return catMeta;

    return {
      ...catMeta,
      treatments: items.map((t) => {
        const firstPrice = t.priceOptions?.[0];
        const effectivePrice = firstPrice?.discountPrice ?? firstPrice?.price;
        return {
          name: t.name?.[locale] || t.name?.ko || '',
          slug: t.slug?.current || '',
          category: catMeta.slug,
          price: effectivePrice ? `₩${effectivePrice.toLocaleString()}` : '',
          priceNumeric: effectivePrice || 0,
          hasEvent: t.isEvent || false,
          hasSignature: t.isSignature || false,
          originalPriceNumeric: firstPrice?.price || 0,
          discountRate:
            firstPrice?.price && firstPrice?.discountPrice
              ? Math.round(
                  (1 - firstPrice.discountPrice / firstPrice.price) * 100,
                )
              : 0,
          keywords: t.keywords?.[locale] || t.keywords?.ko || '',
          composition: t.composition?.[locale] || t.composition?.ko || '',
          description:
            t.description?.[locale] ||
            t.description?.ko ||
            t.tagline?.[locale] ||
            t.tagline?.ko ||
            '',
          duration: extractLocale(t.treatmentTime, locale),
          anesthesia: '',
          recovery: extractLocale(t.downtime, locale),
          recommended: t.duration || '',
          imageUrl: t.imageUrl,
        };
      }),
    };
  });
}
