import type { Metadata } from 'next';
import { Suspense, Fragment, type ReactNode } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickEntrySection } from '@/components/home/QuickEntrySection';
import { SignatureProgramSection } from '@/components/home/SignatureProgramSection';
import { PromoSection } from '@/components/home/PromoSection';
import { BAPreviewSection } from '@/components/home/BAPreviewSection';
import { StatsStripSection } from '@/components/home/StatsStripSection';
import { BrandPhilosophySection } from '@/components/home/BrandPhilosophySection';
import { DoctorSection } from '@/components/home/DoctorSection';
import { LocationSection } from '@/components/home/LocationSection';
import { ContactFormSection } from '@/components/home/ContactFormSection';
import { HomePressSection } from '@/components/home/HomePressSection';
import {
  EventPopupModal,
  type PopupItem,
} from '@/components/home/EventPopupModal';
import {
  siteDescriptions,
  getAlternates,
  ogLocales,
  siteNames,
} from '@/lib/seo/keywords';
import { getHeroContent } from '@/lib/data/hero';
import { getQuickEntryData } from '@/lib/data/quickEntry';
import { getEventTreatments } from '@/lib/data/treatments';
import { getHomeBACases } from '@/lib/data/ba';
import { getStats } from '@/lib/data/stats';
import { getDoctors } from '@/lib/data/doctors';
import { getBrandPhilosophy } from '@/lib/data/brand';
import {
  getClinicInfo,
  getContactSectionConfig,
  getBusinessHours,
} from '@/lib/data/clinic';
import { getSignaturePrograms } from '@/lib/data/signaturePrograms';
import { getSectionVisibility } from '@/lib/data/visibility';
import { getPageHero } from '@/lib/data/hero';
import { sanityFetch } from '@/lib/sanity/fetch';
import { eventPopupQuery, homePressQuery } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    description: siteDescriptions[locale] ?? siteDescriptions.ko,
    alternates: getAlternates(locale),
    openGraph: {
      title: siteNames[locale] ?? siteNames.ko,
      description: siteDescriptions[locale] ?? siteDescriptions.ko,
      locale: ogLocales[locale] ?? 'ko_KR',
      images: [
        { url: '/images/heroes/brand-hero.png', width: 1200, height: 630 },
      ],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const visibility = await getSectionVisibility();

  const [
    hero,
    quickEntryData,
    signaturePrograms,
    eventTreatments,
    baCases,
    pressItems,
    stats,
    brandPhilosophy,
    doctors,
    clinicInfo,
    contactConfig,
    businessHours,
    popups,
    contactHero,
  ] = await Promise.all([
    visibility.home.hero ? getHeroContent(locale) : null,
    visibility.home.quickEntry ? getQuickEntryData(locale) : null,
    visibility.home.signature ? getSignaturePrograms(locale) : null,
    visibility.home.promo ? getEventTreatments(locale) : null,
    visibility.home.bnA ? getHomeBACases(locale) : null,
    visibility.home.press
      ? sanityFetch<unknown[]>(homePressQuery, { locale })
      : null,
    visibility.home.stats ? getStats(locale) : null,
    visibility.home.brandPhilosophy ? getBrandPhilosophy(locale) : null,
    visibility.home.doctors ? getDoctors(locale) : null,
    visibility.home.location || visibility.home.contact
      ? getClinicInfo(locale)
      : null,
    visibility.home.contact ? getContactSectionConfig(locale) : null,
    visibility.home.contact ? getBusinessHours() : null,
    sanityFetch<PopupItem[]>(eventPopupQuery, { locale }),
    visibility.home.contact ? getPageHero('contact', locale) : null,
  ]);

  const quickEntryTabs = quickEntryData?.tabs ?? [];
  const cardsByTab = quickEntryData?.cardsByTab ?? {};

  const contactBannerUrl = contactHero?.heroImage
    ? (urlFor(contactHero.heroImage)?.width(1600).url() ?? null)
    : null;

  const popupList = popups ?? [];
  const popupImageUrls = popupList.map((p) =>
    p.image ? (urlFor(p.image)?.width(480).url() ?? '') : '',
  );

  const DEFAULT_HOME_ORDER = [
    'hero',
    'quickEntry',
    'signature',
    'promo',
    'bnA',
    'press',
    'stats',
    'brandPhilosophy',
    'doctors',
    'location',
    'contact',
  ];
  const homeOrder = visibility.homeOrder?.length
    ? visibility.homeOrder
    : DEFAULT_HOME_ORDER;
  const orderedHomeKeys = [
    ...homeOrder.filter((k) => DEFAULT_HOME_ORDER.includes(k)),
    ...DEFAULT_HOME_ORDER.filter((k) => !homeOrder.includes(k)),
  ];

  const homeSections: Record<string, ReactNode> = {
    hero: visibility.home.hero && hero ? <HeroSection hero={hero} /> : null,
    quickEntry: visibility.home.quickEntry ? (
      <QuickEntrySection
        cardsByTab={cardsByTab ?? {}}
        tabs={quickEntryTabs ?? []}
      />
    ) : null,
    signature:
      visibility.home.signature && signaturePrograms ? (
        <SignatureProgramSection
          locale={locale}
          programs={signaturePrograms}
          showPrice={visibility.treatments.showPrice}
        />
      ) : null,
    promo:
      visibility.home.promo && eventTreatments ? (
        <PromoSection locale={locale} events={eventTreatments} />
      ) : null,
    bnA:
      visibility.home.bnA && baCases ? (
        <BAPreviewSection cases={baCases} />
      ) : null,
    press:
      visibility.home.press && pressItems && pressItems.length > 0 ? (
        <HomePressSection locale={locale} items={pressItems as never} />
      ) : null,
    stats:
      visibility.home.stats && stats ? (
        <StatsStripSection stats={stats} />
      ) : null,
    brandPhilosophy:
      visibility.home.brandPhilosophy && brandPhilosophy ? (
        <BrandPhilosophySection
          locale={locale}
          slogan={brandPhilosophy.slogan}
          subtitle={brandPhilosophy.subtitle}
          badge={brandPhilosophy.badge}
          values={brandPhilosophy.values}
        />
      ) : null,
    doctors:
      visibility.home.doctors && doctors ? (
        <DoctorSection doctors={doctors} />
      ) : null,
    location:
      visibility.home.location && clinicInfo ? (
        <LocationSection clinicInfo={clinicInfo} locale={locale} />
      ) : null,
    contact:
      visibility.home.contact && contactConfig && businessHours ? (
        <Suspense fallback={<div className="h-[600px] bg-[#faf8f5]" />}>
          <ContactFormSection
            config={contactConfig}
            businessHours={businessHours}
            showPreferredDatetime={visibility.contact.showPreferredDatetime}
            bannerImageUrl={contactBannerUrl}
          />
        </Suspense>
      ) : null,
  };

  return (
    <>
      <EventPopupModal popups={popupList} imageUrls={popupImageUrls} />
      {orderedHomeKeys.map((key) =>
        homeSections[key] ? (
          <Fragment key={key}>{homeSections[key]}</Fragment>
        ) : null,
      )}
    </>
  );
}
