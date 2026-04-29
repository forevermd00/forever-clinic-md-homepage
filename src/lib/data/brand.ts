import { sanityFetch } from '@/lib/sanity/fetch';
import { brandPhilosophyQuery } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';

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
  backgroundImage?: string;
  content?: string;
  values: BrandValue[];
};

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
    backgroundImage: data.backgroundImage
      ? urlFor(data.backgroundImage)?.width(1920).height(800).url() || undefined
      : undefined,
    content: data.content,
    values:
      data.values?.map((v) => ({
        key: v._key,
        titleKo: v.titleKo || '',
        titleEn: v.titleEn || '',
        description: v.description || '',
        image: v.image
          ? urlFor(v.image)?.width(600).height(400).url() || undefined
          : undefined,
      })) ?? [],
  };
}
