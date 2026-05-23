import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo/keywords';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/estimate'],
      },
      // 지역 검색 엔진
      { userAgent: 'Baiduspider', allow: '/' },
      { userAgent: 'YandexBot', allow: '/' },
      { userAgent: 'Yeti', allow: '/' },
      // AI 검색 크롤러 (GEO 노출을 위한 허용)
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
