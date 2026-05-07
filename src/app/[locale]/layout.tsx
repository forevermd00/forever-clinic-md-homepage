import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingCTA } from '@/components/layout/FloatingCTA';
import { SessionProvider } from 'next-auth/react';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMedicalBusinessJsonLd } from '@/lib/seo/jsonld';
import { sanityFetch } from '@/lib/sanity/fetch';
import { clinicInfoQuery } from '@/lib/sanity/queries';
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
  const clinicInfo = await sanityFetch<{
    address?: string;
    phone?: string;
    email?: string;
  } | null>(clinicInfoQuery, { locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Adobe Fonts (Typekit) — kit: uac7ujz
            Sandoll (KO), Minion3 (EN), TT SongTi (ZH), Kozuka Mincho Pro (JA) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function(d) {
            var config = { kitId: 'uac7ujz', scriptTimeout: 3000, async: true },
            h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
          })(document);
        `,
          }}
        />
      </head>
      <body>
        <JsonLd data={getMedicalBusinessJsonLd(locale)} />
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main>{children}</main>
            <Footer locale={locale} clinicInfo={clinicInfo ?? undefined} />
            <FloatingCTA />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
