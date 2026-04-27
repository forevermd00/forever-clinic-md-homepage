import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickEntrySection } from '@/components/home/QuickEntrySection';
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
import { getPromotions } from '@/lib/data/promotions';
import { getBACases } from '@/lib/data/ba';
import { getStats } from '@/lib/data/stats';
import { getDoctors } from '@/lib/data/doctors';
import { getClinicInfo } from '@/lib/data/clinic';

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
    promotions,
    baCases,
    stats,
    doctors,
    clinicInfo,
  ] = await Promise.all([
    getHeroContent(locale),
    getQuickEntryCards('treatment', locale),
    getQuickEntryCards('concern', locale),
    getQuickEntryCards('situation', locale),
    getPromotions(locale),
    getBACases(locale),
    getStats(locale),
    getDoctors(locale),
    getClinicInfo(locale),
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
      <PromoSection locale={locale} promotions={promotions} />
      <BAPreviewSection cases={baCases} />
      <StatsStripSection stats={stats} />
      <DoctorSection doctors={doctors} />
      <LocationSection clinicInfo={clinicInfo} />
      <ContactFormSection />
    </>
  );
}
