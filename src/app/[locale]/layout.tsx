import type { Metadata } from 'next';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingCTA } from '@/components/layout/FloatingCTA';
import { SessionProvider } from 'next-auth/react';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMedicalBusinessJsonLd } from '@/lib/seo/jsonld';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { GA_MEASUREMENT_ID, isGAEnabled } from '@/lib/analytics/config';
import { sanityFetch } from '@/lib/sanity/fetch';
import {
  clinicInfoQuery,
  navTreatmentsQuery,
  type NavTreatment,
} from '@/lib/sanity/queries';
import { getSectionVisibility } from '@/lib/data/visibility';
import {
  getKeywords,
  siteNames,
  siteDescriptions,
  ogLocales,
  getAlternates,
} from '@/lib/seo/keywords';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: {
      default: siteNames[locale] ?? siteNames.ko,
      template: `%s | ${siteNames[locale] ?? siteNames.ko}`,
    },
    description: siteDescriptions[locale] ?? siteDescriptions.ko,
    keywords: getKeywords(locale),
    alternates: getAlternates(locale),
    openGraph: {
      type: 'website',
      siteName: siteNames[locale] ?? siteNames.ko,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
    verification: {
      google: 'IotcjEEtjt4yVKvwG9Jcf-v2B9W7I7kxWMntfEAM5NQ',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const [clinicInfo, visibility, navTreatments] = await Promise.all([
    sanityFetch<{
      clinicName?: string;
      logoUrl?: string;
      address?: string;
      phone?: string;
      email?: string;
      messengerLinks?: {
        _key: string;
        platform: string;
        url?: string;
        label?: string;
        logo?: { asset?: { url?: string } };
        isVisible?: boolean;
        sortKo?: number;
        sortEn?: number;
        sortZh?: number;
        sortJa?: number;
      }[];
    } | null>(clinicInfoQuery, { locale }),
    getSectionVisibility(),
    sanityFetch<NavTreatment[]>(navTreatmentsQuery),
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/* Adobe Fonts (Typekit) — kit: uac7ujz */}
        <Script
          id="typekit"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(d){var config={kitId:'uac7ujz',scriptTimeout:3000,async:true},h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)})(document);`,
          }}
        />
        <JsonLd
          data={getMedicalBusinessJsonLd(locale, { phone: clinicInfo?.phone })}
        />
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <Header
              logoUrl={clinicInfo?.logoUrl}
              clinicName={clinicInfo?.clinicName}
              navVisibility={visibility.nav}
              mediaVisibility={visibility.media}
              brandVisibility={visibility.brand}
              navTreatments={navTreatments ?? []}
              navOrder={visibility.navOrder ?? undefined}
              megaMenuOrder={visibility.megaMenuOrder ?? undefined}
              brandOrder={visibility.brandOrder ?? undefined}
              mediaOrder={visibility.mediaOrder ?? undefined}
            />
            <main>{children}</main>
            <Footer
              locale={locale}
              clinicInfo={clinicInfo ?? undefined}
              navVisibility={visibility.nav}
              brandVisibility={visibility.brand}
              mediaVisibility={visibility.media}
              megaMenuOrder={visibility.megaMenuOrder}
              brandOrder={visibility.brandOrder}
              mediaOrder={visibility.mediaOrder}
            />
            <FloatingCTA messengerLinks={clinicInfo?.messengerLinks ?? []} />
            <AnalyticsTracker />
          </NextIntlClientProvider>
        </SessionProvider>
        {isGAEnabled && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
}
