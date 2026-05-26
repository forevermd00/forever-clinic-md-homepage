import { sanityFetch } from '@/lib/sanity/fetch';
import { brandPhilosophyQuery } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';

function sanityImageUrl(source: unknown): string | undefined {
  if (!source || typeof source !== 'object') return undefined;
  const img = source as { asset?: { _ref?: string } };
  const ref = img.asset?._ref;
  if (!ref) return undefined;
  // Try urlFor first
  const built = urlFor(source)?.width(600).height(400).url();
  if (built) return built;
  // Direct CDN fallback
  const id = ref.replace(/^image-/, '').replace(/-([a-z]+)$/, '.$1');
  return `https://cdn.sanity.io/images/ecoamz42/production/${id}`;
}

/* ─── Sanity raw shape ─── */

interface SanityBrandPhilosophy {
  slogan?: string;
  subtitle?: string;
  badge?: string;
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
  slogan?: string;
  subtitle?: string;
  badge?: string;
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
    slogan: data.slogan,
    subtitle: data.subtitle,
    badge: data.badge,
    values:
      data.values?.map((v) => ({
        key: v._key,
        titleKo: v.titleKo || '',
        titleEn: v.titleEn || '',
        description: v.description || '',
        image: sanityImageUrl(v.image),
      })) ?? [],
  };
}
