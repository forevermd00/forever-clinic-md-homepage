import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { SectionLayout } from '@/components/common/SectionLayout';
import { CardGrid } from '@/components/common/CardGrid';
import { CTABanner } from '@/components/common/CTABanner';
import { TreatmentCard } from '@/components/treatments/TreatmentCard';
import { TREATMENT_CATEGORIES } from '@/components/treatments/treatmentData';
import { getTreatmentsByCategory } from '@/lib/data/treatments';
import { getPageHero } from '@/lib/data/hero';
import { urlFor } from '@/lib/sanity/image';
import { JsonLd } from '@/components/seo/JsonLd';
import { getItemListJsonLd } from '@/lib/seo/jsonld';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const cat = TREATMENT_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) return {};

  return {
    title: cat.label,
    description: cat.description,
    alternates: getAlternates(locale, `/treatments/${categorySlug}`),
    openGraph: {
      title: `${cat.label} | ${siteNames[locale] ?? siteNames.ko}`,
      description: cat.description,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
  };
}

export function generateStaticParams() {
  return TREATMENT_CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function TreatmentCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  const [category, hero] = await Promise.all([
    getTreatmentsByCategory(categorySlug, locale),
    getPageHero(`category-${categorySlug}`, locale),
  ]);
  const heroImageUrl = hero?.heroImage
    ? urlFor(hero.heroImage)?.width(1920).height(600).url() || undefined
    : undefined;
  const tc = await getTranslations('common');

  if (!category) {
    notFound();
  }

  const baseUrl = 'https://forever-clinic-myeongdong.com';

  return (
    <>
      <JsonLd
        data={getItemListJsonLd(
          category.treatments.map((treatment) => ({
            name: treatment.name,
            url: `${baseUrl}/${locale}/treatments/${category.slug}/${treatment.slug}`,
          })),
          locale,
        )}
      />
      <HeroBanner
        variant="fullscreen"
        title={category.label}
        subtitle={category.description}
        imageSrc={heroImageUrl}
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
