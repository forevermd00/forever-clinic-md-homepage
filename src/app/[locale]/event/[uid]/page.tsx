export const revalidate = 60;

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  EventOptionSelector,
  type EventSelectorTreatment,
} from '@/components/event/EventOptionSelector';
import { getEventByUid } from '@/lib/data/events';
import { getSectionVisibility } from '@/lib/data/visibility';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

function fmtDate(d?: string): string {
  if (!d) return '';
  return d.slice(0, 10).replace(/-/g, '.');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; uid: string }>;
}): Promise<Metadata> {
  const { locale, uid } = await params;
  const event = await getEventByUid(uid, locale);
  if (!event) return {};
  const siteName = siteNames[locale] ?? siteNames.ko;
  const ogImage = event.pcImageUrl || event.mobileImageUrl;
  return {
    title: event.title,
    description: event.oneLineDescription || event.title,
    alternates: getAlternates(locale, `/event/${uid}`),
    openGraph: {
      title: `${event.title} | ${siteName}`,
      description: event.oneLineDescription || event.title,
      locale: ogLocales[locale] ?? 'ko_KR',
      type: 'website',
      siteName,
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630 }] }
        : {}),
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; uid: string }>;
}) {
  const { locale, uid } = await params;
  setRequestLocale(locale);

  // 상세페이지는 nav 토글과 무관하게 동작(팝업 링크는 메뉴 노출 여부와 별개).
  // 노출 여부는 getEventByUid의 isVisible 필터로 통제.
  const visibility = await getSectionVisibility();

  const event = await getEventByUid(uid, locale);
  if (!event) notFound();

  const t = await getTranslations('event');
  const tt = await getTranslations('treatments');
  const tc = await getTranslations('common');

  const period =
    event.startDate || event.endDate
      ? `${fmtDate(event.startDate)} ~ ${fmtDate(event.endDate)}`
      : '';

  const selectorTreatments: EventSelectorTreatment[] = event.treatments
    .filter((tr) => tr.options.length > 0)
    .map((tr) => ({
      slug: tr.slug,
      name: tr.name,
      category: tr.category,
      options: tr.options,
    }));

  const hasSelector =
    visibility.treatments.showPrice && selectorTreatments.length > 0;

  return (
    <>
      {/* ── 상단: 이벤트 이미지 + 정보 ── */}
      <section className="bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[760px] px-5 pt-6 pb-8 lg:pt-10">
          <nav className="mb-4 flex items-center gap-1.5 text-[12px] text-[#bcae9f]">
            <Link
              href={`/${locale}/event`}
              data-ga-id="event-detail.breadcrumb"
              className="transition-colors hover:text-[#a83c44]"
            >
              {t('title')}
            </Link>
            <span>/</span>
            <span className="text-[#a83c44]">{event.title}</span>
          </nav>

          {/* 이미지 */}
          {(event.pcImageUrl || event.mobileImageUrl) && (
            <div className="overflow-hidden rounded-[12px] border border-[#ece3d8] bg-white">
              {/* PC */}
              <div className="hidden md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.pcImageUrl || event.mobileImageUrl}
                  alt={event.title}
                  className="block w-full"
                />
              </div>
              {/* 모바일 */}
              <div className="block md:hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.mobileImageUrl || event.pcImageUrl}
                  alt={event.title}
                  className="block w-full"
                />
              </div>
            </div>
          )}

          {/* 정보 */}
          <div className="mt-6">
            {period && (
              <p className="text-[12px] font-medium text-[#a83c44]">
                {t('period')} {period}
              </p>
            )}
            <h1 className="mt-1.5 text-[22px] font-bold text-[#2b2b2b] lg:text-[26px]">
              {event.title}
            </h1>
            {event.oneLineDescription && (
              <p className="mt-2 text-[14px] leading-[1.7] text-[#555]">
                {event.oneLineDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── 상세 이미지 (언어별, 연결 시술 위) ── */}
      {event.detailImageUrl && (
        <section className="bg-white pt-8">
          <div className="mx-auto w-full max-w-[760px] px-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.detailImageUrl}
              alt={event.title}
              className="block w-full"
            />
          </div>
        </section>
      )}

      {/* ── 상세 본문 (선택) ── */}
      {event.description && (
        <section className="bg-white py-10">
          <div className="mx-auto w-full max-w-[760px] px-5">
            <p className="text-[14px] leading-[1.8] whitespace-pre-line text-[#555]">
              {event.description}
            </p>
          </div>
        </section>
      )}

      {/* ── 연결 이벤트 시술 ── */}
      {selectorTreatments.length > 0 && (
        <section className="bg-white py-10 pb-28">
          <div className="mx-auto w-full max-w-[760px] px-5">
            <h2 className="text-[18px] font-bold text-[#2b2b2b]">
              {t('linkedTreatments')}
            </h2>
            <div className="mt-4 h-px w-full bg-[#e6e6e6]" />
            <div className="mt-5 flex flex-col gap-3">
              {selectorTreatments.map((tr) => (
                <Link
                  key={tr.slug}
                  href={`/${locale}/treatments/${tr.category}/${tr.slug}`}
                  data-ga-id={`event-detail.treatment-${tr.slug}`}
                  className="flex items-center justify-between rounded-[10px] border border-[#ece3d8] bg-[#faf8f5] px-4 py-3 transition-colors hover:border-[#a83c44]"
                >
                  <span className="text-[14px] font-medium text-[#2b2b2b]">
                    {tr.name}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4 shrink-0 text-[#a83c44]"
                  >
                    <path
                      d="M7 5l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 하단 고정 시술 선택 창 (시술 상세와 동일 UI) ── */}
      {hasSelector && (
        <EventOptionSelector
          treatments={selectorTreatments}
          labels={{
            selectTreatment: tt('selectTreatment'),
            estimatedAmount: tt('estimatedAmount'),
            book: tt('addToEstimate'),
            added: tc('addedToEstimate'),
            eventBadge: tt('eventLabel'),
            won: tt('wonUnit'),
          }}
        />
      )}
    </>
  );
}
