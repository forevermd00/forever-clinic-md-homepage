import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { PromoCard } from '@/components/promotions/PromoCard';

/* Promo content is CMS data — not translated */
const DUMMY_PROMOS = [
  {
    id: '1',
    slug: 'spring-lifting-event',
    image: undefined,
    badge: 'EVENT',
    title: '봄맞이 리프팅 특별 이벤트',
    description:
      '울쎄라 + 써마지 FLX 동시 시술 시 특별 할인가를 만나보세요. 탄력 있는 피부로 봄을 시작하세요.',
    date: '2026.04.01 ~ 2026.05.31',
    originalPrice: '₩2,500,000',
    discountedPrice: '₩1,890,000',
  },
  {
    id: '2',
    slug: 'first-visit-discount',
    image: undefined,
    badge: 'EVENT',
    title: '첫 방문 고객 20% 할인',
    description:
      '포에버 명동을 처음 방문하시는 고객님께 전 시술 20% 할인 혜택을 드립니다.',
    date: '2026.03.01 ~ 2026.06.30',
    originalPrice: undefined,
    discountedPrice: '전 시술 20% OFF',
  },
  {
    id: '3',
    slug: 'skin-care-package',
    image: undefined,
    badge: 'EVENT',
    title: '프리미엄 스킨케어 패키지',
    description:
      '아쿠아필 + LDM + 진정관리 3회 패키지를 합리적인 가격에 만나보세요.',
    date: '2026.04.15 ~ 2026.05.15',
    originalPrice: '₩900,000',
    discountedPrice: '₩690,000',
  },
];

export default async function PromotionsPage() {
  const t = await getTranslations('promotions');

  return (
    <>
      <HeroBanner
        variant="fullscreen"
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        imageSrc="/images/heroes/promo-hero.png"
        className="!h-[280px] !max-h-[280px]"
      />

      <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-wrap gap-6">
          {DUMMY_PROMOS.map((promo) => (
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
