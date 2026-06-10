export const revalidate = 60;

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { EventCard } from '@/components/event/EventCard';
import { getEvents } from '@/lib/data/events';
import { getPageHero } from '@/lib/data/hero';
import { getSectionVisibility } from '@/lib/data/visibility';
import { urlFor } from '@/lib/sanity/image';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

const DEFAULT_BANNER = '/images/event-banner-default.png';

const titles: Record<string, string> = {
  ko: '이벤트',
  en: 'Events',
  zh: '活动',
  ja: 'イベント',
};
const descriptions: Record<string, string> = {
  ko: '포에버의원 명동점의 진행 중인 이벤트와 프로모션을 확인하세요.',
  en: 'Check the latest events and promotions at Forever Clinic Myeongdong.',
  zh: '查看明洞Forever皮肤科正在进行的活动与优惠。',
  ja: 'フォーエバークリニック明洞の開催中のイベント・プロモーションをご確認ください。',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] ?? titles.ko,
    description: descriptions[locale] ?? descriptions.ko,
    alternates: getAlternates(locale, '/event'),
    openGraph: {
      title: `${titles[locale] ?? titles.ko} | ${siteNames[locale] ?? siteNames.ko}`,
      description: descriptions[locale] ?? descriptions.ko,
      locale: ogLocales[locale] ?? 'ko_KR',
      images: [{ url: DEFAULT_BANNER, width: 1200, height: 630 }],
    },
  };
}

export default async function EventListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const visibility = await getSectionVisibility();
  if (!visibility.nav.event) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('event');

  const [hero, events] = await Promise.all([
    getPageHero('event', locale),
    getEvents(locale),
  ]);

  const heroImageUrl = hero?.heroImage
    ? (urlFor(hero.heroImage)?.width(1920).height(400).url() ?? DEFAULT_BANNER)
    : DEFAULT_BANNER;

  return (
    <>
      <HeroBanner
        variant="page-title"
        title={hero?.title || t('title')}
        subtitle={hero?.subtitle || t('heroSubtitle')}
        imageSrc={heroImageUrl}
      />

      <section className="bg-[#faf8f5] py-10 lg:py-16">
        <div className="mx-auto w-full max-w-[var(--container-max)] px-5 lg:px-[120px]">
          {events.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <p className="text-[14px] text-[#9a8d84]">{t('empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  locale={locale}
                  periodLabel={t('period')}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
