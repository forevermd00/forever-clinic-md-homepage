import { getTranslations } from 'next-intl/server';
import type { HeroData } from '@/lib/data/hero';

interface HeroSectionProps {
  hero?: HeroData | null;
}

export async function HeroSection({ hero }: HeroSectionProps = {}) {
  const t = await getTranslations('home');

  const title = hero?.mainTitle || t('heroTitle');
  const subtitle = hero?.mainSubtitle || t('heroSubtitle');

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center overflow-hidden bg-[#c4b7a9]">
      {/* Background image */}
      <img
        src="/images/home/hero-1.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content — centered */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
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
