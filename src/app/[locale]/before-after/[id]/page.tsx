import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { getBADetail } from '@/lib/data/ba';
import { BALockOverlay } from '@/components/ba/BALockOverlay';
import { getPageHero } from '@/lib/data/hero';
import { urlFor } from '@/lib/sanity/image';

export default async function BADetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations('ba');
  const tc = await getTranslations('common');

  const [cmsDetail, hero] = await Promise.all([
    getBADetail(id, locale),
    getPageHero('before-after', locale),
  ]);
  if (!cmsDetail) notFound();

  const heroImageUrl = hero?.heroImage
    ? urlFor(hero.heroImage)?.width(1200).height(630).url() || undefined
    : undefined;

  const detail = {
    id: cmsDetail._id,
    displayTitle: [cmsDetail.title, cmsDetail.sessions]
      .filter(Boolean)
      .join(' — '),
    description: cmsDetail.description,
    beforeImage: cmsDetail.beforeImage,
    afterImage: cmsDetail.afterImage,
    prevId: cmsDetail.prevCase?._id,
    nextId: cmsDetail.nextCase?._id,
  };

  return (
    <>
      {/* Hero */}
      <HeroBanner
        variant="fullscreen"
        title={hero?.title || t('title')}
        subtitle={hero?.subtitle || t('heroSubtitle')}
        imageSrc={heroImageUrl}
        className="!h-[280px] !max-h-[280px]"
      />

      {/* BA Detail Section */}
      <section className="bg-white px-5 py-12 md:px-10 lg:px-[120px]">
        <div className="mx-auto max-w-[var(--container-max)]">
          {/* Title */}
          {detail.displayTitle && (
            <h2 className="text-forever-charcoal mb-10 text-center text-[24px] font-bold">
              {detail.displayTitle}
            </h2>
          )}

          {/* Before / After — arrows on sides, images side-by-side (desktop) / stacked (mobile) */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Left arrow — always takes space to keep images centered */}
            <div className="flex w-10 shrink-0 justify-center">
              {detail.prevId && (
                <Link
                  href={`/${locale}/before-after/${detail.prevId}`}
                  className="flex size-7 items-center justify-center text-[18px] text-[#aaa] transition-colors hover:text-[#353535]"
                  aria-label={tc('previous')}
                  data-ga-id="ba-detail-prev"
                >
                  &#8249;
                </Link>
              )}
            </div>

            {/* Image pair */}
            <div className="flex flex-1 flex-col gap-4 md:flex-row">
              {/* Before */}
              <div className="flex-1">
                <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px]">
                  <BALockOverlay
                    locale={locale}
                    className="absolute inset-0 rounded-[8px]"
                  >
                    {detail.beforeImage ? (
                      <Image
                        src={detail.beforeImage}
                        alt="Before"
                        fill
                        className="rounded-[8px] object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 rounded-[8px] bg-[#d4c7bd]" />
                    )}
                  </BALockOverlay>
                </div>
                <p className="mt-2 text-center text-[13px] font-bold text-[#999]">
                  BEFORE
                </p>
              </div>

              {/* After */}
              <div className="flex-1">
                <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px]">
                  {detail.afterImage ? (
                    <Image
                      src={detail.afterImage}
                      alt="After"
                      fill
                      className="rounded-[8px] object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-[8px] bg-[#f0e5d9]" />
                  )}
                </div>
                <p className="mt-2 text-center text-[13px] font-bold text-[#a83d45]">
                  AFTER
                </p>
              </div>
            </div>

            {/* Right arrow */}
            <div className="flex w-10 shrink-0 justify-center">
              {detail.nextId && (
                <Link
                  href={`/${locale}/before-after/${detail.nextId}`}
                  className="flex size-7 items-center justify-center text-[18px] text-[#aaa] transition-colors hover:text-[#353535]"
                  aria-label={tc('next')}
                  data-ga-id="ba-detail-next"
                >
                  &#8250;
                </Link>
              )}
            </div>
          </div>

          {/* Back to list */}
          <div className="mt-10 text-center">
            <Link
              href={`/${locale}/before-after`}
              data-ga-id="ba-detail-back-to-list"
              className="text-[14px] text-[#706163] transition-colors hover:text-[#353535]"
            >
              &larr; {tc('backToList')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#2b2b2b] px-5 py-16 text-center md:px-10 lg:px-[120px]">
        <h2 className="text-[24px] font-bold text-white">{t('ctaTitle')}</h2>
        <p className="mt-3 text-[15px] text-[#b3b3b3]">{t('ctaDescription')}</p>
        <Link
          href={`/${locale}/contact`}
          data-ga-id="ba-detail-cta-contact"
          className="mt-6 inline-flex items-center justify-center rounded-[4px] bg-white px-8 py-3.5 text-[15px] font-bold text-[#2b2b2b] transition-colors hover:bg-neutral-100"
        >
          {tc('consultationBooking')}
        </Link>
      </section>
    </>
  );
}
