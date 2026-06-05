import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { PromoCard } from '@/components/promotions/PromoCard';
import { getPromotions } from '@/lib/data/promotions';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { getPageHero } from '@/lib/data/hero';
import { urlFor } from '@/lib/sanity/image';

const titles: Record<string, string> = {
  ko: '이벤트 & 프로모션',
  en: 'Events & Promotions',
  zh: '活动与优惠',
  ja: 'イベント＆プロモーション',
};
const descriptions: Record<string, string> = {
  ko: '포에버의원 명동점(포에버 클리닉) 진행 중인 이벤트와 프로모션. 울쎄라, 써마지, 보톡스 할인 정보.',
  en: 'Current events and promotions at Forever Clinic Myeongdong. Ultherapy, Thermage, Botox discounts.',
  zh: '明洞Forever皮肤科（Forever Clinic）正在进行的活动与优惠。超声刀、热玛吉、肉毒素折扣信息。',
  ja: 'フォーエバークリニック明洞の開催中イベントとプロモーション。ウルセラ、サーマジ、ボトックス割引情報。',
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
    alternates: getAlternates(locale, '/promotions'),
    openGraph: {
      title: `${titles[locale] ?? titles.ko} | ${siteNames[locale] ?? siteNames.ko}`,
      description: descriptions[locale] ?? descriptions.ko,
      locale: ogLocales[locale] ?? 'ko_KR',
      images: [
        { url: '/images/heroes/promo-hero.png', width: 1200, height: 630 },
      ],
    },
  };
}

export default async function PromotionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('promotions');

  const [promos, hero] = await Promise.all([
    getPromotions(locale),
    getPageHero('promotions', locale),
  ]);
  const heroImageUrl = hero?.heroImage
    ? urlFor(hero.heroImage)?.width(1200).height(630).url() || undefined
    : undefined;

  return (
    <>
      <HeroBanner
        variant="fullscreen"
        title={hero?.title || t('heroTitle')}
        subtitle={hero?.subtitle || t('heroSubtitle')}
        imageSrc={heroImageUrl}
        className="!h-[280px] !max-h-[280px]"
      />

      <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-wrap gap-6">
          {promos.map((promo) => (
            <PromoCard
              key={promo.id}
              image={promo.image}
              badge={promo.badge}
              title={promo.title}
              description={promo.description}
              date={promo.date}
              originalPrice={promo.originalPrice}
              discountedPrice={promo.discountedPrice}
              className="w-full lg:w-[384px]"
            />
          ))}
        </div>
      </section>
    </>
  );
}
