import type { MetadataRoute } from 'next';
import { TREATMENT_CATEGORIES } from '@/components/treatments/treatmentData';
import { BASE_URL } from '@/lib/seo/keywords';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ecoamz42',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;
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
  let pressPages: string[] = [];
  let blogPages: string[] = [];
  try {
    const [treatments, pressArticles, blogPosts] = await Promise.all([
      sanityClient.fetch<{ slug: string; category: string }[]>(
        `*[_type == "treatment" && isVisible == true]{"slug": slug.current, category}`,
      ),
      sanityClient.fetch<{ slug: string }[]>(
        `*[_type == "pressArticle" && isVisible != false]{"slug": _id}`,
      ),
      sanityClient.fetch<{ slug: string }[]>(
        `*[_type == "blogPost" && isVisible != false]{"slug": slug.current}`,
      ),
    ]);
    treatmentPages = treatments
      .filter((t) => t.slug && t.category)
      .map((t) => `/treatments/${t.category}/${t.slug}`);
    pressPages = pressArticles
      .filter((p) => p.slug)
      .map((p) => `/media/press/${p.slug}`);
    blogPages = blogPosts
      .filter((b) => b.slug)
      .map((b) => `/media/blog/${b.slug}`);
  } catch {
    // fall back to empty if Sanity is unreachable
  }

  const allPages = [
    ...staticPages,
    ...categoryPages,
    ...treatmentPages,
    ...pressPages,
    ...blogPages,
  ];

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
