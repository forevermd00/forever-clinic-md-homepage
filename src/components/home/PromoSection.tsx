import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { EventTreatment } from '@/lib/data/treatments';

interface PromoSectionProps {
  locale?: string;
  events?: EventTreatment[];
}

export async function PromoSection({
  locale = 'ko',
  events,
}: PromoSectionProps) {
  if (!events || events.length === 0) return null;

  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-8 px-5 py-16 md:px-10 lg:px-12">
        <h2 className="w-full text-center text-[28px] font-bold">
          {t('promoTitle')}
        </h2>

        <div className="flex w-full flex-wrap justify-center gap-6">
          {events.map((event) => (
            <Link
              key={event._id}
              href={`/${locale}/treatments?cat=event`}
              className="group w-[370px] overflow-hidden rounded-[8px] bg-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)] transition-shadow hover:drop-shadow-[0_4px_8px_rgba(0,0,0,0.14)]"
            >
              <div className="relative h-[198px] overflow-hidden">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#efe5d9] text-[14px] text-[#706263]">
                    {event.name}
                  </div>
                )}
                <span className="absolute top-3 left-3 rounded-[4px] bg-[#a83c44] px-2 py-1 text-[11px] font-bold text-white">
                  EVENT
                </span>
              </div>
              <div className="flex flex-col gap-1 px-4 pt-2 pb-4">
                <h3 className="text-[15px] font-bold text-[#2b2b2b]">
                  {event.name}
                </h3>
                <p className="text-[12px] text-[#706263]">{event.tagline}</p>
                <span className="mt-1 text-[14px] font-bold text-[#a83c44]">
                  {event.price}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex w-full justify-center">
          <Link
            href={`/${locale}/treatments?cat=event`}
            className="rounded-[24px] border border-[#2b2b2b] px-8 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b] hover:text-white"
          >
            {tc('viewAllPromotions')}
          </Link>
        </div>
      </div>
    </section>
  );
}
