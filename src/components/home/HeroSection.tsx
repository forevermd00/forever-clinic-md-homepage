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
  const heroVideoUrl = hero?.heroVideo ? getVideoUrl(hero.heroVideo) : null;
  const heroImageUrl =
    !heroVideoUrl && hero?.heroImage
      ? urlFor(hero.heroImage)?.width(1920).height(1080).url() || null
      : null;

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
      {/* Background image from CMS (fallback when no video) */}
      {heroImageUrl && (
        <img
          src={heroImageUrl}
          alt=""
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
