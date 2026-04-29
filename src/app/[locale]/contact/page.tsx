import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactFormSection } from '@/components/home/ContactFormSection';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { getClinicInfo } from '@/lib/data/clinic';

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

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('contact');
  const clinic = await getClinicInfo(locale);

  return (
    <>
      {/* Hero */}
      <section className="flex h-[280px] flex-col items-center justify-center gap-3 bg-[#faf8f5] px-4">
        <h1 className="text-[28px] font-bold text-[#2b2b2b] lg:text-[36px]">
          {t('heroTitle')}
        </h1>
        <p className="text-[14px] text-[#706263] lg:text-[16px]">
          {t('heroSubtitle')}
        </p>
      </section>

      {/* Contact Form (same as homepage) */}
      <ContactFormSection />

      {/* Location Info */}
      <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="flex-1 rounded-[12px] bg-[#efe5d9] lg:h-[360px]">
            <div className="flex h-[240px] items-center justify-center text-[14px] text-[#d4c8bd] lg:h-full">
              {t('mapPlaceholder')}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-6">
            <h3 className="text-[20px] font-bold text-[#2b2b2b]">
              {t('locationTitle')}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="size-8 shrink-0 rounded-full bg-[#efe5d9]" />
                <div>
                  <p className="text-[12px] font-medium text-[#d4c8bd]">
                    {t('address')}
                  </p>
                  <p className="text-[14px] leading-[1.5] text-[#2b2b2b]">
                    {clinic.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-8 shrink-0 rounded-full bg-[#efe5d9]" />
                <div>
                  <p className="text-[12px] font-medium text-[#d4c8bd]">
                    {t('phone')}
                  </p>
                  <p className="text-[14px] text-[#2b2b2b]">{clinic.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-8 shrink-0 rounded-full bg-[#efe5d9]" />
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
                <div className="size-8 shrink-0 rounded-full bg-[#efe5d9]" />
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
      </section>
    </>
  );
}
