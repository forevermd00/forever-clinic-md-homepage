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
  slug: string;
  category: string;
  name: string;
  tagline: string;
  price: string;
  originalPrice: string;
  hasDiscount: boolean;
};

export async function getEventTreatments(
  locale: string,
): Promise<EventTreatment[]> {
  const raw = await sanityFetch<
    {
      _id: string;
      slug?: string;
      category?: string;
      name?: Record<string, string>;
      tagline?: Record<string, string>;
      priceOptions?: { price?: number; discountPrice?: number }[];
    }[]
  >(homeEventTreatmentsQuery, {});

  if (!raw || raw.length === 0) return [];

  return raw.map((t) => {
    const firstPrice = t.priceOptions?.[0];
    const originalPrice = firstPrice?.price;
    const discountedPrice = firstPrice?.discountPrice;
    const effectivePrice = discountedPrice ?? originalPrice;
    const hasDiscount = !!(
      discountedPrice &&
      originalPrice &&
      discountedPrice < originalPrice
    );
    return {
      _id: t._id,
      slug: t.slug || '',
      category: t.category || '',
      name: t.name?.[locale] || t.name?.ko || '',
      tagline: t.tagline?.[locale] || t.tagline?.ko || '',
      price: effectivePrice ? `₩${effectivePrice.toLocaleString()}` : '',
      originalPrice: originalPrice ? `₩${originalPrice.toLocaleString()}` : '',
      hasDiscount,
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

  // raw는 이미 관리자와 동일한 전역 정렬(sortOrder asc, _createdAt asc) 상태.
  // 이벤트 등 카테고리 횡단 목록을 관리자 순서와 일치시키기 위한 전역 인덱스 맵.
  const orderMap = new Map(raw.map((t, i) => [t._id, i]));

  // Sanity 데이터를 카테고리별로 그룹핑
  const grouped: Record<string, SanityTreatment[]> = {};
  for (const t of raw) {
    const cat = t.category || '';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  }

  // isSignature == true인 시술 전체 (카테고리 무관)
  const signatureItems = raw.filter((t) => t.isSignature);

  return TREATMENT_CATEGORIES.map((catMeta) => {
    const items =
      catMeta.slug === 'signature' ? signatureItems : grouped[catMeta.slug];
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
          sortIndex: orderMap.get(t._id) ?? Number.MAX_SAFE_INTEGER,
        };
      }),
    };
  });
}
