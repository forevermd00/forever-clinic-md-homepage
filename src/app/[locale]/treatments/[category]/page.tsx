import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { sanityFetch } from '@/lib/sanity/fetch';
import { quickEntryCardBySlugQuery } from '@/lib/sanity/queries';
import { TreatmentCard } from '@/components/treatments/TreatmentCard';
import { TreatmentsTabGrid } from '@/components/treatments/TreatmentsTabGrid';
import {
  getCategoryLabel,
  TREATMENT_CATEGORIES,
} from '@/components/treatments/treatmentData';
import { getSectionVisibility } from '@/lib/data/visibility';
import { HeroBanner } from '@/components/common/HeroBanner';
import { getPageHero } from '@/lib/data/hero';
import { getAllCategories } from '@/lib/data/treatments';
import { urlFor } from '@/lib/sanity/image';

interface Treatment {
  _id: string;
  name: string;
  tagline?: string;
  slug: string;
  category: string;
  imageUrl?: string;
  priceOptions?: { price?: number; discountPrice?: number }[];
  isEvent?: boolean;
  isVisible?: boolean;
}

interface QuickEntryCardData {
  _id: string;
  title?: string;
  description?: string;
  slug: string;
  treatments?: Treatment[];
}

function formatPrice(
  priceOptions: Treatment['priceOptions'],
  _locale: string,
): string {
  const first = priceOptions?.[0];
  if (!first?.price) return '';
  const price = first.discountPrice ?? first.price;
  return `₩${price.toLocaleString()}`;
}

export const dynamic = 'force-dynamic';

export default async function TreatmentCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;

  const isKnownCategory = TREATMENT_CATEGORIES.some((c) => c.slug === category);
  if (isKnownCategory) {
    redirect(`/${locale}/treatments?cat=${category}`);
  }

  // QuickEntry 카드 슬러그로 처리
  const [card, visibility, hero, categories, tc] = await Promise.all([
    sanityFetch<QuickEntryCardData>(quickEntryCardBySlugQuery, {
      slug: category,
      locale,
    }),
    getSectionVisibility(),
    getPageHero('treatments', locale),
    getAllCategories(locale),
    getTranslations('common'),
  ]);

  if (!card) notFound();

  const showPrice = visibility.treatments?.showPrice !== false;
  const showDetail = visibility.treatments?.detail !== false;

  const treatments = (card.treatments ?? []).filter(
    (t) => t.isVisible !== false,
  );

  const heroImageUrl = hero?.heroImage
    ? urlFor(hero.heroImage)?.width(1920).height(400).url() || undefined
    : undefined;

  return (
    <>
      {/* Hero */}
      <HeroBanner
        variant="page-title"
        title={card.title || ''}
        subtitle={card.description || undefined}
        imageSrc={heroImageUrl}
      />

      {/* 탭 바 (선택 없음) */}
      <Suspense
        fallback={<div className="h-12 border-b-2 border-[#e8ded6] bg-white" />}
      >
        <TreatmentsTabGrid locale={locale} categories={categories} tabsOnly />
      </Suspense>

      {/* 카테고리 헤더 */}
      <div className="border-b border-[#e8ded6] bg-[#faf8f5] px-5 py-8 md:px-10 lg:px-12">
        <div className="mx-auto max-w-[var(--container-max)]">
          <p className="text-[12px] font-medium tracking-widest text-[#a83c44] uppercase">
            QUICK ENTRY
          </p>
          <h2 className="mt-1 text-[22px] font-bold text-[#2b2b2b] md:text-[26px]">
            {card.title || ''}
          </h2>
          {card.description && (
            <p className="mt-2 text-[14px] leading-[1.6] text-[#706263]">
              {card.description}
            </p>
          )}
        </div>
      </div>

      {/* 시술 그리드 */}
      <div className="bg-white px-5 py-10 md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1272px]">
          {treatments.length === 0 ? (
            <p className="text-[14px] text-[#9ca3af]">
              등록된 시술이 없습니다.
            </p>
          ) : (
            <div
              className="grid justify-center gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}
            >
              {treatments.map((t) => {
                const catObj = TREATMENT_CATEGORIES.find(
                  (c) => c.slug === t.category,
                );
                const catLabel = catObj
                  ? getCategoryLabel(catObj, locale)
                  : t.category;
                return (
                  <TreatmentCard
                    key={t._id}
                    name={t.name}
                    slug={t.slug}
                    category={t.category}
                    categoryLabel={catLabel}
                    price={formatPrice(t.priceOptions, locale)}
                    hasEvent={t.isEvent}
                    locale={locale}
                    showDetail={showDetail}
                    showPrice={showPrice}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 하단 상담 CTA */}
      <section className="bg-[#5c1f24] py-12 text-center">
        <h2 className="text-[22px] font-bold text-white lg:text-[26px]">
          {tc('startConsultation')}
        </h2>
        <p className="mt-2 text-[13px] text-[rgba(255,255,255,0.6)]">
          {tc('findRightTreatment')}
        </p>
        <Link
          href={`/${locale}/contact`}
          className="mt-6 inline-flex items-center justify-center rounded-[4px] border border-white px-8 py-3 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
        >
          {tc('consultationReservation')}
        </Link>
      </section>
    </>
  );
}
