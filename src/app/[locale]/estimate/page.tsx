import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { EstimateClient } from '@/components/estimate/EstimateClient';
import { getAlternates } from '@/lib/seo/keywords';

const titles: Record<string, string> = {
  ko: '나의 견적',
  en: 'My Estimate',
  zh: '我的报价',
  ja: 'お見積り',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] ?? titles.ko,
    robots: { index: false, follow: false },
    alternates: getAlternates(locale, '/estimate'),
  };
}

export default async function EstimatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('estimate');

  return (
    <>
      <section className="flex h-[280px] items-center justify-center bg-[#faf8f5]">
        <div className="text-center">
          <h1 className="text-forever-charcoal text-[28px] font-bold lg:text-[36px]">
            {t('myEstimate')}
          </h1>
          <p className="mt-3 text-base text-neutral-500">{t('heroSubtitle')}</p>
        </div>
      </section>

      <EstimateClient locale={locale} />
    </>
  );
}
