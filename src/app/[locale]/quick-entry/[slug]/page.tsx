import { notFound } from 'next/navigation';
import Link from 'next/link';
import { sanityFetch } from '@/lib/sanity/fetch';
import { quickEntryCardBySlugQuery } from '@/lib/sanity/queries';
import { TreatmentCard } from '@/components/treatments/TreatmentCard';
import {
  getCategoryLabel,
  TREATMENT_CATEGORIES,
} from '@/components/treatments/treatmentData';
import { getSectionVisibility } from '@/lib/data/visibility';

interface Treatment {
  _id: string;
  name: string;
  tagline?: string;
  slug: string;
  category: string;
  imageUrl?: string;
  priceOptions?: { price?: number; discountPrice?: number }[];
  isEvent?: boolean;
  isVisible?: boolean;
}

interface QuickEntryCardData {
  _id: string;
  title?: string;
  slug: string;
  treatments?: Treatment[];
}

function formatPrice(
  priceOptions: Treatment['priceOptions'],
  locale: string,
): string {
  const first = priceOptions?.[0];
  if (!first?.price) return '';
  const price = first.discountPrice ?? first.price;
  if (locale === 'ko') return `₩${price.toLocaleString()}`;
  if (locale === 'zh' || locale === 'ja') return `₩${price.toLocaleString()}`;
  return `₩${price.toLocaleString()}`;
}

export default async function QuickEntryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const [card, visibility] = await Promise.all([
    sanityFetch<QuickEntryCardData>(quickEntryCardBySlugQuery, {
      slug,
      locale,
    }),
    getSectionVisibility(),
  ]);

  if (!card) notFound();

  const showPrice = visibility.treatments?.showPrice !== false;
  const showDetail = visibility.treatments?.detail !== false;

  const treatments = (card.treatments ?? []).filter(
    (t) => t.isVisible !== false,
  );

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-12 md:py-16">
      <div className="mb-8">
        <Link
          href={`/${locale}/treatments`}
          data-ga-id="quick-entry.back-to-treatments"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-[#9ca3af] hover:text-[#a83c44]"
        >
          ← 시술 목록
        </Link>
        {card.title && (
          <h1 className="mt-2 text-[28px] font-bold text-[#2b2b2b] md:text-[36px]">
            {card.title}
          </h1>
        )}
      </div>

      {treatments.length === 0 ? (
        <p className="text-[14px] text-[#9ca3af]">등록된 시술이 없습니다.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {treatments.map((t) => {
            const catObj = TREATMENT_CATEGORIES.find(
              (c) => c.slug === t.category,
            );
            const catLabel = catObj
              ? getCategoryLabel(catObj, locale)
              : t.category;
            return (
              <TreatmentCard
                key={t._id}
                name={t.name}
                slug={t.slug}
                category={t.category}
                categoryLabel={catLabel}
                price={formatPrice(t.priceOptions, locale)}
                hasEvent={t.isEvent}
                locale={locale}
                showDetail={showDetail}
                showPrice={showPrice}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
