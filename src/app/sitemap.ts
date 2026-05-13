import type { MetadataRoute } from 'next';
import { TREATMENT_CATEGORIES } from '@/components/treatments/treatmentData';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ecoamz42',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://forever-clinic-myeongdong.com';
  const locales = ['ko', 'en', 'zh', 'ja'];

  const staticPages = [
    '',
    '/before-after',
    '/treatments',
    '/brand',
    '/promotions',
    '/contact',
    '/media/press',
    '/media/video',
    '/media/blog',
    '/media/notice',
  ];

  // Category pages
  const categoryPages = TREATMENT_CATEGORIES.map(
    (c) => `/treatments/${c.slug}`,
  );

  // Treatment detail pages from Sanity
  let treatmentPages: string[] = [];
  try {
    const treatments = await sanityClient.fetch<
      { slug: string; category: string }[]
    >(
      `*[_type == "treatment" && isVisible == true]{"slug": slug.current, category}`,
    );
    treatmentPages = treatments
      .filter((t) => t.slug && t.category)
      .map((t) => `/treatments/${t.category}/${t.slug}`);
  } catch {
    // fall back to empty if Sanity is unreachable
  }

  const allPages = [...staticPages, ...categoryPages, ...treatmentPages];

  const entries: MetadataRoute.Sitemap = allPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency:
        page === ''
          ? ('daily' as const)
          : page === '/promotions'
            ? ('daily' as const)
            : ('weekly' as const),
      priority: page === '' ? 1.0 : page.startsWith('/treatments') ? 0.9 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${page}`]),
        ),
      },
    })),
  );

  return entries;
}
