import { getTranslations } from 'next-intl/server';
import type { HeroData } from '@/lib/data/hero';
import { urlFor } from '@/lib/sanity/image';
import { projectId, dataset } from '@/lib/sanity/config';

interface HeroSectionProps {
  hero?: HeroData | null;
}

/**
 * Sanity file asset ref 형식: "file-{id}-{ext}"
 * CDN URL: https://cdn.sanity.io/files/{projectId}/{dataset}/{id}.{ext}
 */
function getVideoUrl(heroVideo: unknown): string | null {
  if (!heroVideo || typeof heroVideo !== 'object') return null;
  const v = heroVideo as Record<string, unknown>;
  const assetObj = v.asset as Record<string, unknown> | undefined;
  const ref = assetObj?._ref as string | undefined;
  if (!ref) return null;
  // ref: "file-abc123-mp4"
  const match = ref.match(/^file-(.+)-([a-z0-9]+)$/);
  if (!match) return null;
  const [, id, ext] = match;
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`;
}

export async function HeroSection({ hero }: HeroSectionProps = {}) {
  const t = await getTranslations('home');

  const title = hero?.title || t('heroTitle');
  const subtitle = hero?.subtitle || t('heroSubtitle');
  const badge = hero?.badge ?? t('heroSince');
  const videoUrl = hero?.heroVideo ? getVideoUrl(hero.heroVideo) : null;
  const imageUrl = hero?.heroImage
    ? urlFor(hero.heroImage)?.width(1920).height(1080).url() || null
    : null;

  // 배경 선택: 기본은 이미지. backgroundType이 'video'면 영상 우선.
  // 선택한 매체가 비어 있으면 있는 매체로 자동 폴백(양방향).
  const preferVideo = hero?.backgroundType === 'video';
  let heroVideoUrl: string | null = null;
  let heroImageUrl: string | null = null;
  if (preferVideo) {
    if (videoUrl) heroVideoUrl = videoUrl;
    else heroImageUrl = imageUrl;
  } else {
    if (imageUrl) heroImageUrl = imageUrl;
    else heroVideoUrl = videoUrl;
  }

  return (
    <section
      className="relative flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center overflow-hidden bg-[#c4b7a9]"
      data-ga-section="home-hero"
    >
      {/* Background video from CMS (preferred over image) */}
      {heroVideoUrl && (
        <video
          src={heroVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Background image from CMS (fallback when no video)
          Googlebot WRS가 /_next/image 최적화 프록시는 렌더 시점에 못 가져와
          히어로가 빈 채로 색인되는 문제 → Brand 히어로처럼 Sanity CDN을
          직접 쓰는 plain <img>로 서빙(이미 ?w=1920&h=1080로 리사이즈됨).
          LCP 위해 fetchPriority high + eager. */}
      {heroImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImageUrl}
          alt={title}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content - centered */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {badge && (
          <p className="mb-5 text-[13px] font-medium tracking-[4px] text-white/90 uppercase">
            {badge}
          </p>
        )}
        <h1 className="text-[32px] leading-[1.3] font-bold whitespace-pre-line text-white md:text-[40px] md:leading-[52px] lg:text-[48px] lg:leading-[62px]">
          {title}
        </h1>
        <p className="mt-4 text-[16px] text-white/90 md:text-[18px]">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
