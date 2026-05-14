'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

const VALUE_KEYS = ['honesty', 'precision', 'expertise', 'dignity'] as const;
const VALUE_ENGLISH = {
  honesty: 'Honesty',
  precision: 'Precision',
  expertise: 'Expertise',
  dignity: 'Dignity',
} as const;
const VALUE_IMAGES = {
  honesty: '/images/home/brand-honesty.png',
  precision: '/images/home/brand-precision.png',
  expertise: '/images/home/brand-expertise.png',
  dignity: '/images/home/brand-dignity.png',
} as const;

export function BrandPhilosophySection({
  locale = 'ko',
  slogan,
}: {
  locale?: string;
  slogan?: string | null;
}) {
  const t = useTranslations('brand');

  return (
    <section className="bg-white py-16">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3 px-5 text-center md:px-10 lg:px-12">
        <span className="text-[12px] font-medium tracking-[3px] text-[#706263]">
          BRAND PHILOSOPHY · Since 2009
        </span>
        <h2 className="text-[28px] font-bold text-[#2b2b2b]">
          {t('smartBoutiquePhilosophy')}
        </h2>
        <p className="text-[14px] text-[#706263]">
          {t('philosophyDescription')}
        </p>
        {slogan && (
          <p className="text-[15px] font-medium text-[#a83c44] italic">
            {slogan}
          </p>
        )}
      </div>

      {/* Value rows - alternating, compact */}
      {VALUE_KEYS.map((key, index) => {
        const imageOnLeft = index % 2 === 0;

        return (
          <div
            key={key}
            className={cn(
              'mx-auto flex max-w-[1280px] flex-col items-center gap-8 px-5 py-8',
              'md:flex-row md:items-center md:justify-center md:gap-16 md:px-10 lg:px-[120px]',
              !imageOnLeft && 'md:flex-row-reverse',
            )}
          >
            {/* Image - 320x320 on desktop, fluid on mobile */}
            <div className="bg-forever-beige aspect-square w-full max-w-[320px] shrink-0 overflow-hidden rounded-[8px]">
              <img
                src={VALUE_IMAGES[key]}
                alt={t(key)}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Text */}
            <div className="flex w-full flex-col gap-2.5 md:max-w-[400px]">
              <span className="text-[12px] font-medium tracking-[2px] text-[#706263]">
                {VALUE_ENGLISH[key]}
              </span>
              <h3 className="text-[32px] font-bold text-[#2b2b2b]">{t(key)}</h3>
              <p className="text-[15px] leading-relaxed text-[#706263]">
                {t(`${key}Desc`)}
              </p>
            </div>
          </div>
        );
      })}

      {/* CTA */}
      <div className="mt-8 flex justify-center">
        <Link
          href={`/${locale}/brand`}
          className="rounded-[24px] border border-[#2b2b2b] px-8 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b] hover:text-white"
        >
          {t('brandStoryLink')} →
        </Link>
      </div>
    </section>
  );
}
