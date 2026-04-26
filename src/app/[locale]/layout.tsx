import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingCTA } from '@/components/layout/FloatingCTA';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMedicalBusinessJsonLd } from '@/lib/seo/jsonld';
import {
  getKeywords,
  siteNames,
  siteDescriptions,
  ogLocales,
  getAlternates,
} from '@/lib/seo/keywords';

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

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <JsonLd data={getMedicalBusinessJsonLd(locale)} />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer locale={locale} />
          <FloatingCTA />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
