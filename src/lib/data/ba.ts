import { sanityFetch } from '@/lib/sanity/fetch';
import {
  baCasesFilteredQuery,
  baCaseDetailQuery,
  homeBACasesQuery,
} from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';

/* ─── Sanity raw shapes ─── */

interface SanityBACase {
  _id: string;
  beforeImage?: unknown;
  afterImage?: unknown;
  treatment?: {
    name: string;
    slug: string;
    category: string;
  };
  sessions?: string;
  elapsed?: string;
}

interface SanityBACaseDetail extends SanityBACase {
  description?: string;
  prevCase?: { _id: string };
  nextCase?: { _id: string };
}

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

/* ─── Mapping helpers ─── */

function mapBACase(raw: SanityBACase): BACase {
  return {
    _id: raw._id,
    beforeImage: raw.beforeImage
      ? urlFor(raw.beforeImage)?.width(600).height(400).url() || undefined
      : undefined,
    afterImage: raw.afterImage
      ? urlFor(raw.afterImage)?.width(600).height(400).url() || undefined
      : undefined,
    treatment: raw.treatment,
    sessions: raw.sessions,
    elapsed: raw.elapsed,
  };
}

/* ─── Fetch Functions ─── */

export async function getHomeBACases(locale: string): Promise<BACase[]> {
  const data = await sanityFetch<SanityBACase[]>(homeBACasesQuery, { locale });
  return data?.map(mapBACase) ?? [];
}

export async function getBACases(
  locale: string,
  category = 'all',
  page = 1,
): Promise<{ items: BACase[]; total: number; totalPages: number }> {
  const data = await sanityFetch<SanityBACase[]>(baCasesFilteredQuery, {
    locale,
    category,
  });
  const all = data?.map(mapBACase) ?? [];
  const total = all.length;
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize),
    total,
    totalPages,
  };
}

export async function getBADetail(
  id: string,
  locale: string,
): Promise<BACaseDetail | null> {
  const data = await sanityFetch<SanityBACaseDetail>(baCaseDetailQuery, {
    id,
    locale,
  });
  if (!data) return null;
  return {
    ...mapBACase(data),
    description: data.description,
    prevCase: data.prevCase,
    nextCase: data.nextCase,
  };
}
