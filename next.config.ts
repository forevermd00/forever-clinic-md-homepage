import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
    formats: ['image/avif', 'image/webp'],
  },
  // 경로 이전·정규화는 영구 이동이므로 모두 301로 처리한다.
  // (구글 색인 신호 전달 — 임시 307은 옛 URL을 색인에 유지)
  async redirects() {
    return [
      // 루트 → 기본 로케일 (Accept-Language 협상 제거, 고정 301)
      {
        source: '/',
        destination: '/ko',
        statusCode: 301,
      },
      // 레거시 시그니처 경로 → treatments 하위 정식 경로
      {
        source: '/:locale(ko|en|zh|ja)/signature/:slug',
        destination: '/:locale/treatments/signature/:slug',
        statusCode: 301,
      },
      // 카테고리 인덱스 경로 → treatments 필터 쿼리 (정규 URL)
      {
        source:
          '/:locale(ko|en|zh|ja)/treatments/:category(signature|lifting-laser|petit-lifting|skincare|skin-booster|hair-removal|anesthesia)',
        destination: '/:locale/treatments?cat=:category',
        statusCode: 301,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
