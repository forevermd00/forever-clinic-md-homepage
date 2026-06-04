'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import type { BrandValue } from '@/lib/data/brand';

const VALUE_KEYS = ['honesty', 'precision', 'expertise', 'dignity'] as const;
const VALUE_ENGLISH = {
  honesty: 'Honesty',
  precision: 'Precision',
  expertise: 'Expertise',
  dignity: 'Dignity',
} as const;

export function BrandPhilosophySection({
  locale = 'ko',
  slogan,
  subtitle,
  badge,
  values,
}: {
  locale?: string;
  slogan?: string | null;
  subtitle?: string | null;
  badge?: string | null;
  values?: BrandValue[];
}) {
  const t = useTranslations('brand');

  return (
    <section className="bg-white py-16" data-ga-section="brand-philosophy">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3 px-5 text-center md:px-10 lg:px-12">
        <span className="text-[12px] font-medium tracking-[3px] text-[#706263]">
          {badge || 'BRAND PHILOSOPHY · Since 2008'}
        </span>
        <h2 className="text-[28px] font-bold text-[#2b2b2b]">
          {slogan || t('smartBoutiquePhilosophy')}
        </h2>
        <p className="text-[14px] text-[#706263]">
          {subtitle || t('philosophyDescription')}
        </p>
      </div>

      {/* Value rows - alternating, compact */}
      {VALUE_KEYS.map((key, index) => {
        const cms = values?.[index];
        const imageOnLeft = index % 2 === 0;

        const title =
          cms?.titleKo && locale === 'ko'
            ? cms.titleKo
            : cms?.titleEn && locale === 'en'
              ? cms.titleEn
              : t(key);
        const description = cms?.description || t(`${key}Desc`);
        const imageSrc = cms?.image || '';

        return (
          <div
            key={key}
            className={cn(
              'mx-auto flex max-w-[1280px] flex-col items-center gap-8 px-5 py-8',
              'md:flex-row md:items-center md:justify-center md:gap-16 md:px-10 lg:px-[120px]',
              !imageOnLeft && 'md:flex-row-reverse',
            )}
          >
            {/* Image */}
            <div className="bg-forever-beige aspect-square w-full max-w-[320px] shrink-0 overflow-hidden rounded-[8px]">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#efe5d9]" />
              )}
            </div>

            {/* Text */}
            <div className="flex w-full flex-col gap-2.5 md:max-w-[400px]">
              <span className="text-[12px] font-medium tracking-[2px] text-[#706263]">
                {VALUE_ENGLISH[key]}
              </span>
              <h3 className="text-[32px] font-bold text-[#2b2b2b]">{title}</h3>
              <p className="text-[15px] leading-relaxed text-[#706263]">
                {description}
              </p>
            </div>
          </div>
        );
      })}

      {/* CTA */}
      <div className="mt-8 flex justify-center">
        <Link
          href={`/${locale}/brand`}
          data-ga-id="brand-philosophy-story-link"
          className="rounded-[24px] border border-[#2b2b2b] px-8 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b] hover:text-white"
        >
          {t('brandStoryLink')} →
        </Link>
      </div>
    </section>
  );
}
