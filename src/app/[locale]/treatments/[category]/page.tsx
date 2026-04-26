import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { SectionLayout } from '@/components/common/SectionLayout';
import { CardGrid } from '@/components/common/CardGrid';
import { CTABanner } from '@/components/common/CTABanner';
import { TreatmentCard } from '@/components/treatments/TreatmentCard';
import {
  TREATMENT_CATEGORIES,
  getCategoryBySlug,
} from '@/components/treatments/treatmentData';

export function generateStaticParams() {
  return TREATMENT_CATEGORIES.map((c) => ({ category: c.slug }));
}

const heroImages: Record<string, string> = {
  lifting: '/images/heroes/lifting-hero.png',
  skincare: '/images/heroes/skincare-hero.png',
  toning: '/images/heroes/toning-hero.png',
  'botox-filler': '/images/heroes/botox-hero.png',
};

export default async function TreatmentCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  const tc = await getTranslations('common');

  if (!category) {
    notFound();
  }

  return (
    <>
      <HeroBanner
        variant="fullscreen"
        title={category.label}
        subtitle={category.description}
        imageSrc={heroImages[categorySlug]}
        className="!h-[280px] !max-h-[280px]"
      />

      <SectionLayout
        background="white"
        padding="lg"
        className="!px-5 md:!px-10 lg:!px-12"
      >
        <CardGrid columns={{ mobile: 2, tablet: 2, desktop: 4 }} gap="lg">
          {category.treatments.map((treatment) => (
            <TreatmentCard
              key={treatment.slug}
              name={treatment.name}
              slug={treatment.slug}
              category={category.slug}
              categoryLabel={category.label}
              price={treatment.price}
              hasEvent={treatment.hasEvent}
              locale={locale}
            />
          ))}
        </CardGrid>
      </SectionLayout>

      <CTABanner
        variant="highlight"
        title={`${category.label}, ${tc('whichTreatmentFits')}`}
        description={tc('findRightTreatment')}
        ctaText={tc('consultationReservation')}
        ctaHref={`/${locale}/contact`}
        className="[&_a]:border-0 [&_a]:bg-white [&_a]:text-[#2b2b2b] [&_a]:hover:bg-neutral-100"
      />
    </>
  );
}
