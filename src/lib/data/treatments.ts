import { sanityFetch } from '@/lib/sanity/fetch';
import {
  treatmentsByCategoryQuery,
  treatmentDetailQuery,
} from '@/lib/sanity/queries';
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
  priceOptions?: { label?: string; price?: number; discountPrice?: number }[];
  isEvent?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
  duration?: string;
  downtime?: string;
  treatmentTime?: string;
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
      duration: t.treatmentTime || '',
      anesthesia: '',
      recovery: t.downtime || '',
      recommended: t.duration || '',
    })),
  };
}

export async function getTreatmentDetail(slug: string, locale: string) {
  return sanityFetch(treatmentDetailQuery, { slug, locale });
}

export async function getAllCategories(
  _locale: string,
): Promise<TreatmentCategory[]> {
  // Categories are structural — always use the static list as fallback.
  // When Sanity is configured, this could fetch dynamic categories.
  return TREATMENT_CATEGORIES;
}
