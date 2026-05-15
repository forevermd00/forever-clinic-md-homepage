import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ContactFormSection } from '@/components/home/ContactFormSection';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import {
  getClinicInfo,
  getContactSectionConfig,
  getBusinessHours,
} from '@/lib/data/clinic';
import { getSectionVisibility } from '@/lib/data/visibility';
import {
  buildGoogleMapsUrl,
  buildGoogleMapsUrlFromAddress,
  buildMapEmbedUrl,
} from '@/lib/utils/map';
import { GoogleMap } from '@/components/common/GoogleMap';

const titles: Record<string, string> = {
  ko: '예약 및 상담',
  en: 'Contact & Reservation',
  zh: '预约与咨询',
  ja: '予約・お問い合わせ',
};
const descriptions: Record<string, string> = {
  ko: '포에버 클리닉 명동 예약 및 상담. 온라인 상담, 오시는 길, 진료 시간 안내.',
  en: 'Contact Forever Clinic Myeongdong. Online consultation, directions, and business hours.',
  zh: '联系永恒诊所明洞。在线咨询、交通指南、营业时间。',
  ja: 'フォーエバークリニック明洞へのお問い合わせ。オンライン相談、アクセス、診療時間。',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] ?? titles.ko,
    description: descriptions[locale] ?? descriptions.ko,
    alternates: getAlternates(locale, '/contact'),
    openGraph: {
      title: `${titles[locale] ?? titles.ko} | ${siteNames[locale] ?? siteNames.ko}`,
      description: descriptions[locale] ?? descriptions.ko,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
  };
}

/* ----------------------------------------------------------------
   Contact - Reservations & Consultations
   Hero -> Online consultation form -> Directions
   ---------------------------------------------------------------- */

export const dynamic = 'force-dynamic';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('contact');
  const [clinic, contactConfig, businessHours, visibility] = await Promise.all([
    getClinicInfo(locale),
    getContactSectionConfig(locale),
    getBusinessHours(),
    getSectionVisibility(),
  ]);

  return (
    <>
      {/* Contact Form with header */}
      <Suspense fallback={<div className="h-[600px] bg-[#faf8f5]" />}>
        <ContactFormSection
          config={contactConfig}
          businessHours={businessHours}
          showPreferredDatetime={visibility.contact.showPreferredDatetime}
        />
      </Suspense>

      {/* Location Info */}
      <section className="bg-[#faf8f5] py-12 lg:py-16">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10 lg:px-12">
          <div className="mx-auto flex max-w-[840px] flex-col gap-8 lg:max-w-none lg:flex-row lg:gap-12">
            <div className="relative h-[320px] w-full overflow-hidden rounded-[12px] bg-[#efe5d9] lg:h-[480px] lg:flex-1">
              {clinic.latitude && clinic.longitude ? (
                <>
                  <GoogleMap
                    lat={clinic.latitude}
                    lng={clinic.longitude}
                    className="h-full w-full"
                    locale={locale}
                  />
                  <Link
                    href={buildGoogleMapsUrl(clinic.latitude, clinic.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-[6px] bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#2b2b2b] shadow-sm backdrop-blur-sm hover:bg-white"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    지도에서 열기
                  </Link>
                </>
              ) : clinic.address ? (
                <>
                  <iframe
                    src={buildMapEmbedUrl(clinic.address)}
                    className="h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="지도"
                  />
                  <Link
                    href={buildGoogleMapsUrlFromAddress(clinic.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-[6px] bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#2b2b2b] shadow-sm backdrop-blur-sm hover:bg-white"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    지도에서 열기
                  </Link>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-[14px] text-[#9c8e87]">
                  {t('mapPlaceholder')}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-6">
              <h3 className="text-[20px] font-bold text-[#2b2b2b]">
                {t('locationTitle')}
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efe5d9]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#706263"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#d4c8bd]">
                      {t('address')}
                    </p>
                    {clinic.latitude && clinic.longitude ? (
                      <Link
                        href={buildGoogleMapsUrl(
                          clinic.latitude,
                          clinic.longitude,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] leading-[1.5] text-[#2b2b2b] underline-offset-2 hover:underline"
                      >
                        {clinic.address}
                      </Link>
                    ) : (
                      <p className="text-[14px] leading-[1.5] text-[#2b2b2b]">
                        {clinic.address}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efe5d9]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#706263"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.51 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#d4c8bd]">
                      {t('phone')}
                    </p>
                    <p className="text-[14px] text-[#2b2b2b]">{clinic.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efe5d9]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#706263"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#d4c8bd]">
                      {t('hours')}
                    </p>
                    <p className="text-[14px] leading-[1.5] whitespace-pre-line text-[#2b2b2b]">
                      {clinic.hours}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efe5d9]">
                    {/* 지하철 아이콘 */}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#706263"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="4" y="3" width="16" height="16" rx="4" />
                      <path d="M4 11h16" />
                      <path d="M8 19l-2 2" />
                      <path d="M16 19l2 2" />
                      <path d="M9 7h1" />
                      <path d="M14 7h1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#d4c8bd]">
                      {t('subway') ?? '지하철'}
                    </p>
                    <p className="text-[14px] leading-[1.5] whitespace-pre-line text-[#2b2b2b]">
                      {clinic.subway}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
