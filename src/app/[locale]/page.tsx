import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickEntrySection } from '@/components/home/QuickEntrySection';
import { SignatureProgramSection } from '@/components/home/SignatureProgramSection';
import { PromoSection } from '@/components/home/PromoSection';
import { BAPreviewSection } from '@/components/home/BAPreviewSection';
import { StatsStripSection } from '@/components/home/StatsStripSection';
import { DoctorSection } from '@/components/home/DoctorSection';
import { LocationSection } from '@/components/home/LocationSection';
import { ContactFormSection } from '@/components/home/ContactFormSection';
import {
  siteDescriptions,
  getAlternates,
  ogLocales,
  siteNames,
} from '@/lib/seo/keywords';
import { getHeroContent } from '@/lib/data/hero';
import { getQuickEntryCards } from '@/lib/data/quickEntry';
import { getEventTreatments } from '@/lib/data/treatments';
import { getHomeBACases } from '@/lib/data/ba';
import { getStats } from '@/lib/data/stats';
import { getDoctors } from '@/lib/data/doctors';
import { getClinicInfo, getContactSectionConfig } from '@/lib/data/clinic';
import { getSignaturePrograms } from '@/lib/data/signaturePrograms';

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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [
    hero,
    qeTreatment,
    qeConcern,
    qeSituation,
    signaturePrograms,
    eventTreatments,
    baCases,
    stats,
    doctors,
    clinicInfo,
    contactConfig,
  ] = await Promise.all([
    getHeroContent(locale),
    getQuickEntryCards('treatment', locale),
    getQuickEntryCards('concern', locale),
    getQuickEntryCards('situation', locale),
    getSignaturePrograms(locale),
    getEventTreatments(locale),
    getHomeBACases(locale),
    getStats(locale),
    getDoctors(locale),
    getClinicInfo(locale),
    getContactSectionConfig(locale),
  ]);

  const cardsByTab = {
    treatment: qeTreatment,
    concern: qeConcern,
    situation: qeSituation,
  };

  return (
    <>
      <HeroSection hero={hero} />
      <QuickEntrySection cardsByTab={cardsByTab} />
      <SignatureProgramSection locale={locale} programs={signaturePrograms} />
      <PromoSection locale={locale} events={eventTreatments} />
      <BAPreviewSection cases={baCases} />
      <StatsStripSection stats={stats} />
      <DoctorSection doctors={doctors} />
      <LocationSection clinicInfo={clinicInfo} />
      <Suspense fallback={<div className="h-[600px] bg-[#faf8f5]" />}>
        <ContactFormSection config={contactConfig} />
      </Suspense>
    </>
  );
}
