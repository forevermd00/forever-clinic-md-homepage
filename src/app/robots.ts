import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/estimate'],
      },
      { userAgent: 'Baiduspider', allow: '/' },
      { userAgent: 'YandexBot', allow: '/' },
    ],
    sitemap: 'https://forever-clinic-myeongdong.com/sitemap.xml',
  };
}
