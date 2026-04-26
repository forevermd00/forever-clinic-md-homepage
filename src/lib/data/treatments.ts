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

export async function getTreatmentsByCategory(
  category: string,
  _locale: string,
): Promise<TreatmentCategory | undefined> {
  const fallback = getCategoryBySlug(category);

  const sanityData = await sanityFetch(
    treatmentsByCategoryQuery,
    { category },
    null,
  );

  if (sanityData) {
    // When Sanity returns data, map it to the TreatmentCategory shape.
    // For now, return sanityData as-is (shape alignment will happen when CMS is live).
    return sanityData as unknown as TreatmentCategory;
  }

  return fallback;
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
