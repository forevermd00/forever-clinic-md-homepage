import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { DoctorGrid } from '@/components/brand/DoctorGrid';
import { GalleryCarousel } from '@/components/brand/GalleryCarousel';
import { EquipmentShowcase } from '@/components/brand/EquipmentShowcase';
import { LocationInfo } from '@/components/brand/LocationInfo';
import { BrandSectionNav } from '@/components/brand/BrandSectionNav';
import { StatsStripSection } from '@/components/home/StatsStripSection';
import { GoogleMap } from '@/components/common/GoogleMap';
import Link from 'next/link';
import {
  buildAmapUrl,
  buildGoogleMapsUrl,
  buildStaticMapUrl,
} from '@/lib/utils/map';
import { getDoctors } from '@/lib/data/doctors';
import { getStats } from '@/lib/data/stats';
import { getClinicInfo, getFacilities, getEquipment } from '@/lib/data/clinic';
import { getBrandPhilosophy } from '@/lib/data/brand';
import { getPageHero } from '@/lib/data/hero';
import { urlFor } from '@/lib/sanity/image';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMedicalBusinessJsonLd } from '@/lib/seo/jsonld';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { getSectionVisibility } from '@/lib/data/visibility';

import { Fragment, type ReactNode } from 'react';
import type { Metadata } from 'next';

const brandTitles: Record<string, string> = {
  ko: '브랜드 스토리',
  en: 'Brand Story',
  zh: '品牌故事',
  ja: 'ブランドストーリー',
};
const brandDescriptions: Record<string, string> = {
  ko: '포에버의원 명동점(포에버 클리닉) 소개. 전문의 의료진 프로필, 최신 레이저·리프팅 장비, 시술실 시설 안내. 명동역 도보 1분.',
  en: 'About Forever Clinic Myeongdong. Our dermatologist team, state-of-the-art laser & lifting equipment, and modern facilities. 1 min from Myeongdong Station.',
  zh: '明洞Forever皮肤科（Forever Clinic）介绍。专业医生团队介绍、最新激光·提升设备、施术室设施指南。明洞站步行1分钟。',
  ja: 'フォーエバークリニック明洞のご紹介。皮膚科専門医チーム、最新レーザー・リフティング機器、モダンな施設案内。明洞駅から徒歩1分。',
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

export const revalidate = 60;

export default async function BrandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const visibility = await getSectionVisibility();
  if (!visibility.nav.brand) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('brand');
  const th = await getTranslations('home');
  const bv = visibility.brand;

  const [
    doctors,
    facilities,
    equipment,
    clinicInfo,
    brandPhilosophy,
    hero,
    stats,
  ] = await Promise.all([
    bv.doctors ? getDoctors(locale) : null,
    bv.facilities ? getFacilities(locale) : null,
    bv.equipment ? getEquipment(locale) : null,
    bv.location ? getClinicInfo(locale) : null,
    bv.philosophy ? getBrandPhilosophy(locale) : null,
    getPageHero('brand', locale),
    bv.stats !== false ? getStats(locale) : null,
  ]);
  const heroImageUrl = hero?.heroImage
    ? urlFor(hero.heroImage)?.width(1200).height(630).url() || undefined
    : undefined;

  // Map CMS brand values to page structure (key order: honesty, precision, expertise, dignity)
  const valueKeyMap: Record<string, { tKey: string }> = {
    honesty: { tKey: 'honesty' },
    precision: { tKey: 'precision' },
    expertise: { tKey: 'expertise' },
    dignity: { tKey: 'dignity' },
  };

  // Build philosophy values: CMS values override translation keys when available
  const cmsValues = brandPhilosophy?.values ?? [];
  const philosophyValues = ['honesty', 'precision', 'expertise', 'dignity'].map(
    (key, index) => {
      const cms = cmsValues[index];
      const mapping = valueKeyMap[key];
      return {
        key,
        title:
          cms?.titleKo && locale === 'ko'
            ? cms.titleKo
            : cms?.titleEn && locale === 'en'
              ? cms.titleEn
              : t(mapping.tKey),
        description: cms?.description || t(`${mapping.tKey}Desc`),
        descriptionDesktop: cms?.description || t(`${mapping.tKey}DescDesktop`),
        image: cms?.image || '',
      };
    },
  );

  const brandJsonLd = {
    ...getMedicalBusinessJsonLd(locale),
    medicalSpecialty: ['Dermatology', 'PlasticSurgery'],
    description:
      locale === 'ko'
        ? '명동 프리미엄 피부과 · 리프팅, 스킨케어, 토닝, 보톡스/필러 전문'
        : locale === 'en'
          ? 'Premium dermatology clinic in Myeongdong - lifting, skincare, toning, botox & filler'
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
        title={hero?.title || th('heroTitle')}
        subtitle={hero?.subtitle || th('heroSubtitle')}
        imageSrc={heroImageUrl}
        className="!h-[280px] !max-h-[280px]"
      />

      {/* Section Tabs (sticky) - client component */}
      <BrandSectionNav
        brandVisibility={bv}
        brandOrder={visibility.brandOrder}
      />

      {/* Ordered brand sections */}
      {(() => {
        const DEFAULT_BRAND_ORDER = [
          'philosophy',
          'doctors',
          'facilities',
          'equipment',
          'location',
          'stats',
        ];
        const brandOrder = visibility.brandOrder?.length
          ? visibility.brandOrder
          : DEFAULT_BRAND_ORDER;
        const orderedKeys = [
          ...brandOrder.filter((k) => DEFAULT_BRAND_ORDER.includes(k)),
          ...DEFAULT_BRAND_ORDER.filter((k) => !brandOrder.includes(k)),
        ];

        const brandSections: Record<string, ReactNode> = {
          philosophy: bv.philosophy ? (
            <section
              key="philosophy"
              id="philosophy"
              className="scroll-mt-[120px] bg-[#faf8f5]"
            >
              <div className="flex flex-col items-center gap-3 px-4 pt-16 pb-8 lg:pt-20 lg:pb-12">
                <span className="text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
                  {brandPhilosophy?.badge || 'BRAND PHILOSOPHY · Since 2008'}
                </span>
                <h2 className="text-[28px] font-bold text-[#2b2b2b]">
                  {brandPhilosophy?.slogan || t('smartBoutiquePhilosophy')}
                </h2>
                <p className="text-center text-[14px] text-[#706263]">
                  {brandPhilosophy?.subtitle || t('philosophyDescription')}
                </p>
              </div>
              {philosophyValues.map((value, index) => {
                const isEven = index % 2 === 0;
                const bgColor = isEven ? 'bg-white' : 'bg-[#f9f6f3]';
                const imgSrc =
                  typeof value.image === 'string' ? value.image : '';
                return (
                  <div key={value.key} className={bgColor}>
                    <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-[60px] px-[100px] py-[60px] lg:flex">
                      {isEven ? (
                        <>
                          <div className="flex flex-col gap-3">
                            <p className="text-[28px] font-bold text-[#2b2b2b]">
                              {value.title}
                            </p>
                            <p className="text-[14px] whitespace-pre-line text-[#706263]">
                              {value.descriptionDesktop}
                            </p>
                          </div>
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={value.title}
                              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
                            />
                          ) : (
                            <div className="h-[400px] w-[620px] shrink-0 rounded-[8px] bg-[#efe5d9]" />
                          )}
                        </>
                      ) : (
                        <>
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={value.title}
                              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
                            />
                          ) : (
                            <div className="h-[400px] w-[620px] shrink-0 rounded-[8px] bg-[#efe5d9]" />
                          )}
                          <div className="flex flex-col gap-3">
                            <p className="text-[28px] font-bold text-[#2b2b2b]">
                              {value.title}
                            </p>
                            <p className="text-[14px] whitespace-pre-line text-[#706263]">
                              {value.descriptionDesktop}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col pb-4 lg:hidden">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={value.title}
                          className="h-[220px] w-full object-cover"
                        />
                      ) : (
                        <div className="h-[220px] w-full bg-[#efe5d9]" />
                      )}
                      <div className="flex flex-col gap-2 px-5 pt-4">
                        <p className="text-[20px] font-bold text-[#2b2b2b]">
                          {value.title}
                        </p>
                        <p className="text-[12px] text-[#706263]">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ) : null,

          doctors:
            bv.doctors && doctors ? (
              <section
                key="doctors"
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
                  <DoctorGrid doctors={doctors} />
                </div>
              </section>
            ) : null,

          facilities:
            bv.facilities && facilities ? (
              <section
                key="facilities"
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
            ) : null,

          equipment:
            bv.equipment && equipment ? (
              <section
                key="equipment"
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
                  <div className="px-10 md:px-12 lg:px-14">
                    <EquipmentShowcase items={equipment} />
                  </div>
                </div>
              </section>
            ) : null,

          location:
            bv.location && clinicInfo ? (
              <section
                key="location"
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
                    <div className="relative h-[320px] w-full overflow-hidden rounded-[12px] bg-[#efe5d9] lg:h-[480px] lg:flex-1">
                      {clinicInfo.latitude && clinicInfo.longitude ? (
                        locale === 'zh' ? (
                          <>
                            <img
                              src={buildStaticMapUrl(
                                clinicInfo.latitude,
                                clinicInfo.longitude,
                                { w: 840, h: 480, language: 'zh-CN' },
                              )}
                              alt="클리닉 위치"
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            <Link
                              href={buildAmapUrl(
                                clinicInfo.latitude,
                                clinicInfo.longitude,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-ga-id="brand.open-map-amap"
                              className="absolute top-3 left-3 flex items-center gap-1.5 rounded-[6px] bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#2b2b2b] shadow-sm backdrop-blur-sm hover:bg-white"
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
                              {t('openMap')}
                            </Link>
                          </>
                        ) : (
                          <>
                            <GoogleMap
                              lat={clinicInfo.latitude}
                              lng={clinicInfo.longitude}
                              className="h-full w-full"
                              locale={locale}
                            />
                            <Link
                              href={buildGoogleMapsUrl(
                                clinicInfo.latitude,
                                clinicInfo.longitude,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-ga-id="brand.open-map-google"
                              className="absolute top-3 left-3 flex items-center gap-1.5 rounded-[6px] bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#2b2b2b] shadow-sm backdrop-blur-sm hover:bg-white"
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
                              {t('openMap')}
                            </Link>
                          </>
                        )
                      ) : (
                        <div className="flex h-full min-h-[360px] items-center justify-center text-[13px] text-[#808080]">
                          {t('mapArea')}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 items-center">
                      <LocationInfo clinicInfo={clinicInfo} />
                    </div>
                  </div>
                </div>
              </section>
            ) : null,
          stats:
            bv.stats !== false && stats && stats.length > 0 ? (
              <div key="stats" id="stats" className="scroll-mt-[120px]">
                <StatsStripSection stats={stats} />
              </div>
            ) : null,
        };

        return orderedKeys.map((key) =>
          brandSections[key] ? (
            <Fragment key={key}>{brandSections[key]}</Fragment>
          ) : null,
        );
      })()}
    </>
  );
}
