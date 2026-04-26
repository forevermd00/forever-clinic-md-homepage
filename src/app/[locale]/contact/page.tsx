import { getTranslations } from 'next-intl/server';
import { ContactFormSection } from '@/components/home/ContactFormSection';

/* ----------------------------------------------------------------
   Contact — Reservations & Consultations
   Hero -> Online consultation form -> Directions
   ---------------------------------------------------------------- */

export default async function ContactPage() {
  const t = await getTranslations('contact');

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
                    서울특별시 중구 명동길 14, 포에버빌딩 3층
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-8 shrink-0 rounded-full bg-[#efe5d9]" />
                <div>
                  <p className="text-[12px] font-medium text-[#d4c8bd]">
                    {t('phone')}
                  </p>
                  <p className="text-[14px] text-[#2b2b2b]">02-XXX-XXXX</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-8 shrink-0 rounded-full bg-[#efe5d9]" />
                <div>
                  <p className="text-[12px] font-medium text-[#d4c8bd]">
                    {t('hours')}
                  </p>
                  <p className="text-[14px] leading-[1.5] text-[#2b2b2b]">
                    월~금 10:00-19:00
                    <br />토 10:00-16:00 (일·공휴일 휴진)
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
