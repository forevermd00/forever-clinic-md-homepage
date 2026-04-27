import { sanityFetch } from '@/lib/sanity/fetch';
import { brandPhilosophyQuery } from '@/lib/sanity/queries';

/* ─── Sanity raw shape ─── */

interface SanityBrandPhilosophy {
  title?: string;
  subtitle?: string;
  backgroundImage?: unknown;
  content?: string;
  values?: {
    _key: string;
    titleKo?: string;
    titleEn?: string;
    description?: string;
    image?: unknown;
  }[];
}

/* ─── Types ─── */

export type BrandValue = {
  key: string;
  titleKo: string;
  titleEn: string;
  description: string;
  image?: string;
};

export type BrandPhilosophy = {
  title?: string;
  subtitle?: string;
  content?: string;
  values: BrandValue[];
};

/* ─── Fallback ─── */

const FALLBACK_VALUES: BrandValue[] = [];

/* ─── Fetch Function ─── */

export async function getBrandPhilosophy(
  locale: string,
): Promise<BrandPhilosophy | null> {
  const data = await sanityFetch<SanityBrandPhilosophy>(brandPhilosophyQuery, {
    locale,
  });

  if (!data) return null;

  return {
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    values:
      data.values?.map((v) => ({
        key: v._key,
        titleKo: v.titleKo || '',
        titleEn: v.titleEn || '',
        description: v.description || '',
        image: undefined, // Sanity image requires URL builder; leave for now
      })) ?? FALLBACK_VALUES,
  };
}
