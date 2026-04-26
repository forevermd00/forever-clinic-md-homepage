import { sanityFetch } from '@/lib/sanity/fetch';
import { baCasesFilteredQuery, baCaseDetailQuery } from '@/lib/sanity/queries';

/* ─── Types ─── */

export type BACase = {
  _id: string;
  beforeImage?: string;
  afterImage?: string;
  treatment?: {
    name: string;
    slug: string;
    category: string;
  };
  sessions?: string;
  elapsed?: string;
};

export type BACaseDetail = BACase & {
  description?: string;
  prevCase?: { _id: string };
  nextCase?: { _id: string };
};

/* ─── Fallback Data ─── */

const FALLBACK_BA_CASES: BACase[] = [];

/* ─── Fetch Functions ─── */

export async function getBACases(
  locale: string,
  category?: string,
): Promise<BACase[]> {
  const data = await sanityFetch<BACase[]>(
    baCasesFilteredQuery,
    { locale, category: category ?? 'all' },
    FALLBACK_BA_CASES,
  );
  return data ?? FALLBACK_BA_CASES;
}

export async function getBADetail(
  id: string,
  locale: string,
): Promise<BACaseDetail | null> {
  return sanityFetch<BACaseDetail>(baCaseDetailQuery, { id, locale });
}
