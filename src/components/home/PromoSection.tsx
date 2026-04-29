import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Promotion } from '@/lib/data/promotions';

interface PromoSectionProps {
  locale?: string;
  promotions?: Promotion[];
}

export async function PromoSection({
  locale = 'ko',
  promotions,
}: PromoSectionProps) {
  if (!promotions || promotions.length === 0) return null;

  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  const promoCards = promotions.map((p) => ({
    id: p.id,
    badge: p.badge,
    title: p.title,
    description: p.description,
    date: p.date,
    originalPrice: p.originalPrice,
    salePrice: p.discountedPrice,
    image: p.image?.src,
  }));

  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-8 px-5 py-16 md:px-10 lg:px-12">
        <h2 className="w-full text-center text-[28px] font-bold">
          {t('promoTitle')}
        </h2>

        <div className="flex w-full flex-wrap justify-center gap-6">
          {promoCards.map((promo) => (
            <div
              key={promo.id}
              className="w-[370px] overflow-hidden rounded-[8px] bg-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)]"
            >
              <div className="relative h-[198px] overflow-hidden">
                {promo.image ? (
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#efe5d9] text-[14px] text-[#706263]">
                    {promo.title}
                  </div>
                )}
                <span className="absolute top-3 left-3 rounded-[4px] bg-[#a83c44] px-2 py-1 text-[11px] font-bold text-white">
                  {promo.badge}
                </span>
              </div>
              <div className="flex flex-col gap-1 px-4 pt-2 pb-4">
                <h3 className="text-[15px] font-bold text-[#2b2b2b]">
                  {promo.title}
                </h3>
                <p className="text-[12px] text-[#706263]">
                  {promo.description}
                </p>
                <p className="text-[11px] text-[#999]">{promo.date}</p>
                <div className="flex gap-2">
                  {promo.originalPrice && (
                    <span className="text-[13px] text-[#999] line-through">
                      {promo.originalPrice}
                    </span>
                  )}
                  <span className="text-[14px] font-bold text-[#a83c44]">
                    {promo.salePrice}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex w-full justify-center">
          <Link
            href={`/${locale}/promotions`}
            className="rounded-[24px] border border-[#2b2b2b] px-8 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b] hover:text-white"
          >
            {tc('viewAllPromotions')}
          </Link>
        </div>
      </div>
    </section>
  );
}
