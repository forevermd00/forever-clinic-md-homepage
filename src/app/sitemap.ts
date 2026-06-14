import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo/keywords';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ecoamz42',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

type PageEntry = {
  path: string;
  lastModified: Date;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;
  const locales = ['ko', 'en', 'zh', 'ja'];
  const now = new Date();

  const staticEntries: PageEntry[] = [
    { path: '', lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    {
      path: '/treatments',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      path: '/event',
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      path: '/media',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      path: '/brand',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: '/before-after',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      path: '/promotions',
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      path: '/contact',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      path: '/media/press',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      path: '/media/video',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      path: '/media/blog',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      path: '/media/notice',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  let dynamicEntries: PageEntry[] = [];
  try {
    const [treatments, pressArticles, blogPosts] = await Promise.all([
      sanityClient.fetch<
        { slug: string; category: string; updatedAt: string }[]
      >(
        `*[_type == "treatment" && isVisible == true]{
          "slug": slug.current,
          category,
          "updatedAt": _updatedAt
        }`,
      ),
      sanityClient.fetch<{ slug: string; updatedAt: string }[]>(
        `*[_type == "pressArticle" && isVisible != false]{
          "slug": _id,
          "updatedAt": coalesce(publishedAt, _updatedAt)
        }`,
      ),
      sanityClient.fetch<{ slug: string; updatedAt: string }[]>(
        `*[_type == "blogPost" && isVisible != false]{
          "slug": slug.current,
          "updatedAt": coalesce(publishedAt, _updatedAt)
        }`,
      ),
    ]);

    const treatmentEntries: PageEntry[] = treatments
      .filter((t) => t.slug && t.category)
      .map((t) => ({
        path: `/treatments/${t.category}/${t.slug}`,
        lastModified: new Date(t.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.9,
      }));

    const pressEntries: PageEntry[] = pressArticles
      .filter((p) => p.slug)
      .map((p) => ({
        path: `/media/press/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.65,
      }));

    const blogEntries: PageEntry[] = blogPosts
      .filter((b) => b.slug)
      .map((b) => ({
        path: `/media/blog/${b.slug}`,
        lastModified: new Date(b.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    dynamicEntries = [...treatmentEntries, ...pressEntries, ...blogEntries];
  } catch {
    // fall back to empty if Sanity is unreachable
  }

  const allEntries = [...staticEntries, ...dynamicEntries];

  return allEntries.flatMap(
    ({ path, lastModified, changeFrequency, priority }) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            'x-default': `${baseUrl}/ko${path}`,
            ...Object.fromEntries(
              locales.map((l) => [l, `${baseUrl}/${l}${path}`]),
            ),
          },
        },
      })),
  );
}
