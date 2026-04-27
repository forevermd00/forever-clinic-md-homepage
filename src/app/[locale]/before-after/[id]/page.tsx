import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { getBADetail } from '@/lib/data/ba';

const DUMMY_DETAIL = {
  id: '1',
  treatmentName: '울쎄라 리프팅',
  sessionCount: 3,
  totalSessions: 5,
};

export default async function BADetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations('ba');
  const tc = await getTranslations('common');

  const cmsDetail = await getBADetail(id, locale);
  const detail = cmsDetail
    ? {
        id: cmsDetail._id,
        treatmentName: cmsDetail.treatment?.name ?? DUMMY_DETAIL.treatmentName,
        sessionCount: cmsDetail.sessions
          ? parseInt(cmsDetail.sessions, 10) || DUMMY_DETAIL.sessionCount
          : DUMMY_DETAIL.sessionCount,
        totalSessions: DUMMY_DETAIL.totalSessions,
        description: cmsDetail.description,
        beforeImage: cmsDetail.beforeImage,
        afterImage: cmsDetail.afterImage,
        prevId: cmsDetail.prevCase?._id,
        nextId: cmsDetail.nextCase?._id,
      }
    : { ...DUMMY_DETAIL, id };

  return (
    <>
      {/* Hero */}
      <HeroBanner
        variant="fullscreen"
        title={t('title')}
        subtitle={t('heroSubtitle')}
        className="!h-[280px] !max-h-[280px]"
      />

      {/* BA Detail Section */}
      <section className="bg-white px-5 py-12 md:px-10 lg:px-[120px]">
        <div className="mx-auto max-w-[var(--container-max)]">
          {/* Title */}
          <h2 className="text-forever-charcoal mb-10 text-center text-[24px] font-bold">
            {detail.treatmentName} &mdash;{' '}
            {t('sessions', { count: detail.sessionCount })}
          </h2>

          {/* Before / After image pair with arrows */}
          <div className="flex items-center justify-center gap-4">
            {/* Left arrow */}
            <button
              className="shrink-0 rounded-[24px] border border-[#f0e5d9] px-3 py-1 text-lg shadow transition-colors hover:bg-neutral-50"
              aria-label={tc('previous')}
            >
              &#8249;
            </button>

            {/* Images */}
            <div className="flex w-full max-w-4xl gap-4">
              {/* Before */}
              <div className="flex-1">
                <div className="h-[300px] rounded-[8px] bg-[#d4c7bd] md:h-[400px]" />
                <p className="mt-2 text-center text-[13px] font-bold text-[#999]">
                  BEFORE
                </p>
              </div>

              {/* After */}
              <div className="flex-1">
                <div className="h-[300px] rounded-[8px] bg-[#f0e5d9] md:h-[400px]" />
                <p className="mt-2 text-center text-[13px] font-bold text-[#a83d45]">
                  AFTER
                </p>
              </div>
            </div>

            {/* Right arrow */}
            <button
              className="shrink-0 rounded-[24px] border border-[#f0e5d9] px-3 py-1 text-lg shadow transition-colors hover:bg-neutral-50"
              aria-label={tc('next')}
            >
              &#8250;
            </button>
          </div>

          {/* Back to list */}
          <div className="mt-10 text-center">
            <Link
              href={`/${locale}/before-after`}
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
          className="mt-6 inline-flex items-center justify-center rounded-[4px] bg-white px-8 py-3.5 text-[15px] font-bold text-[#2b2b2b] transition-colors hover:bg-neutral-100"
        >
          {tc('consultationBooking')}
        </Link>
      </section>
    </>
  );
}
