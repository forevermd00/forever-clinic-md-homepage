import type { MetadataRoute } from 'next';
import { TREATMENT_CATEGORIES } from '@/components/treatments/treatmentData';

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Treatment detail pages
  const treatmentPages = TREATMENT_CATEGORIES.flatMap((c) =>
    c.treatments.map((t) => `/treatments/${c.slug}/${t.slug}`),
  );

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
