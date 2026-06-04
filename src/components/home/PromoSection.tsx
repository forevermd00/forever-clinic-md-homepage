import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { EventTreatment } from '@/lib/data/treatments';
import { TREATMENT_CATEGORIES } from '@/components/treatments/treatmentData';

interface PromoSectionProps {
  locale?: string;
  events?: EventTreatment[];
}

function getCategoryLabel(slug: string, locale: string): string {
  const cat = TREATMENT_CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return slug;
  if (locale === 'en') return cat.labelEn;
  if (locale === 'zh') return cat.labelZh ?? cat.labelEn;
  if (locale === 'ja') return cat.labelJa ?? cat.labelEn;
  return cat.label;
}

export async function PromoSection({
  locale = 'ko',
  events,
}: PromoSectionProps) {
  if (!events || events.length === 0) return null;

  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  return (
    <section className="bg-[#faf8f5]" data-ga-section="promo">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-8 px-5 py-16 md:px-10 lg:px-12">
        <h2 className="w-full text-center text-[28px] font-bold">
          {t('promoTitle')}
        </h2>

        <div className="mx-auto w-full max-w-[1272px]">
          <div
            className="grid justify-center gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}
          >
            {events.map((event) => (
              <Link
                key={event._id}
                href={
                  event.slug && event.category
                    ? `/${locale}/treatments/${event.category}/${event.slug}`
                    : `/${locale}/treatments?cat=event`
                }
                data-ga-id={`promo-card-${event.slug ?? event._id}`}
                className="group flex flex-col gap-2 rounded-[8px] border border-[#ede3d9] bg-white px-4 py-4 shadow-[0px_1px_2px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md"
              >
                {/* 뱃지 행 */}
                <div className="flex items-center gap-2">
                  <span className="rounded-[4px] border border-[#a83c44] px-2 py-0.5 text-[11px] font-medium text-[#a83c44]">
                    {getCategoryLabel(event.category, locale)}
                  </span>
                  <span className="rounded-[4px] bg-[#a83c44] px-2 py-0.5 text-[11px] font-bold text-white">
                    EVENT
                  </span>
                </div>

                {/* 시술명 */}
                <h3 className="text-[15px] leading-snug font-bold text-[#2b2b2b]">
                  {event.name}
                </h3>

                {/* 가격 */}
                <div className="flex items-baseline gap-2">
                  {event.hasDiscount && (
                    <span className="text-[12px] text-[#b0b0b0] line-through">
                      {event.originalPrice}
                    </span>
                  )}
                  <span className="text-[14px] font-bold text-[#a83c44]">
                    {event.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex w-full justify-center">
          <Link
            href={`/${locale}/treatments?cat=event`}
            data-ga-id="promo-view-all"
            className="rounded-[24px] border border-[#2b2b2b] px-8 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b] hover:text-white"
          >
            {tc('viewAllPromotions')}
          </Link>
        </div>
      </div>
    </section>
  );
}
