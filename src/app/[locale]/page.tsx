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
  return (
    <>
      <HeroSection />
      <QuickEntrySection />
      <PromoSection locale={locale} />
      <BAPreviewSection />
      <StatsStripSection />
      <DoctorSection />
      <LocationSection />
      <ContactFormSection />
    </>
  );
}
