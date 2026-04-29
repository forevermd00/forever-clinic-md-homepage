import { sanityFetch } from '@/lib/sanity/fetch';
import { heroContentQuery, pageHeroQuery } from '@/lib/sanity/queries';

/* ─── Types ─── */

export type HeroData = {
  title?: string;
  subtitle?: string;
  heroVideo?: unknown;
  heroImage?: unknown;
};

export type PageHeroData = {
  title?: string;
  subtitle?: string;
  heroImage?: unknown;
};

/* ─── Fetch Functions ─── */

/** 메인 페이지 히어로 (page-hero-main) */
export async function getHeroContent(locale: string): Promise<HeroData | null> {
  const data = await sanityFetch<HeroData>(heroContentQuery, { locale });
  return data || null;
}

/**
 * 페이지별 히어로 데이터 조회
 * pageKey: 'before-after' | 'treatments' | 'brand' | ...
 */
export async function getPageHero(
  pageKey: string,
  locale: string,
): Promise<PageHeroData | null> {
  const data = await sanityFetch<PageHeroData>(pageHeroQuery, {
    docId: `page-hero-${pageKey}`,
    locale,
  });
  return data || null;
}
