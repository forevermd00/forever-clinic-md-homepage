import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { DoctorCard } from '@/components/brand/DoctorCard';
import { GalleryCarousel } from '@/components/brand/GalleryCarousel';
import { EquipmentShowcase } from '@/components/brand/EquipmentShowcase';
import { LocationInfo } from '@/components/brand/LocationInfo';
import { BrandSectionNav } from '@/components/brand/BrandSectionNav';
import { getDoctors } from '@/lib/data/doctors';
import { getClinicInfo, getFacilities, getEquipment } from '@/lib/data/clinic';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMedicalBusinessJsonLd } from '@/lib/seo/jsonld';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

import type { Metadata } from 'next';

const brandTitles: Record<string, string> = {
  ko: '브랜드 스토리',
  en: 'Brand Story',
  zh: '品牌故事',
  ja: 'ブランドストーリー',
};
const brandDescriptions: Record<string, string> = {
  ko: '포에버 클리닉 명동의 브랜드 철학, 의료진, 시설, 장비를 소개합니다. Smart-Boutique 프리미엄 피부과.',
  en: 'Discover Forever Clinic Myeongdong brand philosophy, doctors, facilities, and equipment. Smart-Boutique premium dermatology.',
  zh: '了解永恒诊所明洞的品牌理念、医疗团队、设施和设备。Smart-Boutique高端皮肤科。',
  ja: 'フォーエバークリニック明洞のブランド哲学、医師、施設、設備をご紹介します。Smart-Boutiqueプレミアム皮膚科。',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: brandTitles[locale] ?? brandTitles.ko,
    description: brandDescriptions[locale] ?? brandDescriptions.ko,
    alternates: getAlternates(locale, '/brand'),
    openGraph: {
      title: `${brandTitles[locale] ?? brandTitles.ko} | ${siteNames[locale] ?? siteNames.ko}`,
      description: brandDescriptions[locale] ?? brandDescriptions.ko,
      locale: ogLocales[locale] ?? 'ko_KR',
      images: [
        { url: '/images/heroes/brand-hero.png', width: 1200, height: 630 },
      ],
    },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('brand');
  const th = await getTranslations('home');

  const [doctors, facilities, equipment, clinicInfo] = await Promise.all([
    getDoctors(locale),
    getFacilities(locale),
    getEquipment(locale),
    getClinicInfo(locale),
  ]);

  const brandJsonLd = {
    ...getMedicalBusinessJsonLd(locale),
    medicalSpecialty: ['Dermatology', 'PlasticSurgery'],
    description:
      locale === 'ko'
        ? '명동 프리미엄 피부과 · 리프팅, 스킨케어, 토닝, 보톡스/필러 전문'
        : locale === 'en'
          ? 'Premium dermatology clinic in Myeongdong — lifting, skincare, toning, botox & filler'
          : locale === 'zh'
            ? '明洞高端皮肤科 · 提升、护肤、调理、肉毒素/填充剂专业'
            : '明洞プレミアム皮膚科 · リフティング、スキンケア、トーニング、ボトックス/フィラー専門',
  };

  return (
    <>
      <JsonLd data={brandJsonLd} />
      {/* Hero */}
      <HeroBanner
        variant="fullscreen"
        title={th('heroTitle')}
        subtitle={th('heroSubtitle')}
        imageSrc="/images/heroes/brand-hero.png"
        className="!h-[280px] !max-h-[280px]"
      />

      {/* Section Tabs (sticky) — client component */}
      <BrandSectionNav />

      {/* Philosophy Section */}
      <section id="philosophy" className="scroll-mt-[120px] bg-[#faf8f5]">
        {/* Section Header */}
        <div className="flex flex-col items-center gap-3 px-4 pt-16 pb-8 lg:pt-20 lg:pb-12">
          <span className="text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
            BRAND PHILOSOPHY
          </span>
          <h2 className="text-[28px] font-bold text-[#2b2b2b]">
            {t('smartBoutiquePhilosophy')}
          </h2>
          <p className="text-center text-[14px] text-[#706263]">
            {t('philosophyDescription')}
          </p>
        </div>

        {/* Value 1: Honesty — text left, image right */}
        <div className="bg-white">
          <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-[60px] px-[100px] py-[60px] lg:flex">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-bold text-[#2b2b2b]">
                {t('honesty')}
              </p>
              <p className="text-[14px] whitespace-pre-line text-[#706263]">
                {t('honestyDescDesktop')}
              </p>
            </div>
            <img
              src="/images/brand/philosophy-honesty.png"
              alt={t('honesty')}
              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
            />
          </div>
          <div className="flex flex-col pb-4 lg:hidden">
            <img
              src="/images/brand/philosophy-honesty.png"
              alt={t('honesty')}
              className="h-[220px] w-full object-cover"
            />
            <div className="flex flex-col gap-2 px-5 pt-4">
              <p className="text-[20px] font-bold text-[#2b2b2b]">
                {t('honesty')}
              </p>
              <p className="text-[12px] text-[#706263]">{t('honestyDesc')}</p>
            </div>
          </div>
        </div>

        {/* Value 2: Precision — image left, text right */}
        <div className="bg-[#f9f6f3]">
          <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-[60px] px-[100px] py-[60px] lg:flex">
            <img
              src="/images/brand/philosophy-precision.png"
              alt={t('precision')}
              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
            />
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-bold text-[#2b2b2b]">
                {t('precision')}
              </p>
              <p className="text-[14px] whitespace-pre-line text-[#706263]">
                {t('precisionDescDesktop')}
              </p>
            </div>
          </div>
          <div className="flex flex-col pb-4 lg:hidden">
            <img
              src="/images/brand/philosophy-precision.png"
              alt={t('precision')}
              className="h-[220px] w-full object-cover"
            />
            <div className="flex flex-col gap-2 px-5 pt-4">
              <p className="text-[20px] font-bold text-[#2b2b2b]">
                {t('precision')}
              </p>
              <p className="text-[12px] text-[#706263]">{t('precisionDesc')}</p>
            </div>
          </div>
        </div>

        {/* Value 3: Expertise — text left, image right */}
        <div className="bg-white">
          <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-[60px] px-[100px] py-[60px] lg:flex">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-bold text-[#2b2b2b]">
                {t('expertise')}
              </p>
              <p className="text-[14px] whitespace-pre-line text-[#706263]">
                {t('expertiseDescDesktop')}
              </p>
            </div>
            <img
              src="/images/brand/philosophy-expertise.png"
              alt={t('expertise')}
              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
            />
          </div>
          <div className="flex flex-col pb-4 lg:hidden">
            <img
              src="/images/brand/philosophy-expertise.png"
              alt={t('expertise')}
              className="h-[220px] w-full object-cover"
            />
            <div className="flex flex-col gap-2 px-5 pt-4">
              <p className="text-[20px] font-bold text-[#2b2b2b]">
                {t('expertise')}
              </p>
              <p className="text-[12px] text-[#706263]">{t('expertiseDesc')}</p>
            </div>
          </div>
        </div>

        {/* Value 4: Dignity — image left, text right */}
        <div className="bg-[#f9f6f3]">
          <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-[60px] px-[100px] py-[60px] lg:flex">
            <img
              src="/images/brand/philosophy-dignity.png"
              alt={t('dignity')}
              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
            />
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-bold text-[#2b2b2b]">
                {t('dignity')}
              </p>
              <p className="text-[14px] whitespace-pre-line text-[#706263]">
                {t('dignityDescDesktop')}
              </p>
            </div>
          </div>
          <div className="flex flex-col pb-4 lg:hidden">
            <img
              src="/images/brand/philosophy-dignity.png"
              alt={t('dignity')}
              className="h-[220px] w-full object-cover"
            />
            <div className="flex flex-col gap-2 px-5 pt-4">
              <p className="text-[20px] font-bold text-[#2b2b2b]">
                {t('dignity')}
              </p>
              <p className="text-[12px] text-[#706263]">{t('dignityDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section
        id="doctors"
        className="scroll-mt-[120px] bg-[#faf8f5] px-4 py-20 md:px-6 lg:px-12"
      >
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-[12px] tracking-wider text-[#d4c8bd]">
              OUR DOCTORS
            </span>
            <h2 className="text-[28px] font-bold text-[#2b2b2b]">
              {t('doctors')}
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.name} doctor={doctor} />
            ))}
          </div>
        </div>
      </section>

      {/* Facility Gallery */}
      <section
        id="facilities"
        className="scroll-mt-[120px] bg-white px-4 py-20 md:px-6 lg:px-12"
      >
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
              FACILITIES
            </span>
            <h2 className="text-[28px] font-bold text-[#2b2b2b]">
              {t('facilityGallery')}
            </h2>
          </div>
          <GalleryCarousel items={facilities} />
        </div>
      </section>

      {/* Equipment Gallery */}
      <section
        id="equipment"
        className="scroll-mt-[120px] bg-[#faf8f5] px-4 py-20 md:px-6 lg:px-12"
      >
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
              EQUIPMENT
            </span>
            <h2 className="text-[28px] font-bold text-[#2b2b2b]">
              {t('equipment')}
            </h2>
          </div>
          <EquipmentShowcase items={equipment} />
        </div>
      </section>

      {/* Location Section */}
      <section
        id="location"
        className="scroll-mt-[120px] bg-white px-4 py-20 md:px-6 lg:px-12"
      >
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
              LOCATION
            </span>
            <h2 className="text-[28px] font-bold text-[#2b2b2b]">
              {t('location')}
            </h2>
          </div>
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Map placeholder */}
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-[12px] bg-[#efe5d9]">
              <span className="text-[13px] text-[#808080]">{t('mapArea')}</span>
            </div>
            {/* Clinic Info */}
            <div className="flex-1">
              <LocationInfo clinicInfo={clinicInfo} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
