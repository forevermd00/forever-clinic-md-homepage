import { sanityFetch } from '@/lib/sanity/fetch';
import { heroContentQuery } from '@/lib/sanity/queries';

/* ─── Types ─── */

export type HeroData = {
  mainTitle?: string;
  mainSubtitle?: string;
  mainVideo?: unknown;
  mainFallbackImage?: unknown;
};

/* ─── Sanity raw shape ─── */

interface SanityHeroContent {
  mainTitle?: string;
  mainSubtitle?: string;
  mainVideo?: unknown;
  mainFallbackImage?: unknown;
}

/* ─── Fetch Function ─── */

export async function getHeroContent(locale: string): Promise<HeroData | null> {
  const data = await sanityFetch<SanityHeroContent>(heroContentQuery, {
    locale,
  });

  if (!data) return null;

  return {
    mainTitle: data.mainTitle,
    mainSubtitle: data.mainSubtitle,
    mainVideo: data.mainVideo,
    mainFallbackImage: data.mainFallbackImage,
  };
}
