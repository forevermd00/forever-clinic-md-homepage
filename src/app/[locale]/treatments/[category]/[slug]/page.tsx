import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  TREATMENT_CATEGORIES,
  getTreatmentBySlug,
  type Treatment,
  type TreatmentCategory,
} from '@/components/treatments/treatmentData';
import { getTreatmentDetail } from '@/lib/data/treatments';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';
import { AddToCartButton } from '@/components/treatments/AddToCartButton';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  getTreatmentProductJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/seo/jsonld';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapCmsTreatment(
  raw: any,
  locale: string,
  categorySlug: string,
): { category: TreatmentCategory; treatment: Treatment } | undefined {
  if (!raw) return undefined;
  const categoryMeta = TREATMENT_CATEGORIES.find(
    (c) => c.slug === categorySlug,
  );
  if (!categoryMeta) return undefined;

  const name = raw.name?.[locale] || raw.name?.ko || '';
  const tagline = raw.tagline?.[locale] || raw.tagline?.ko || '';
  const firstPrice = raw.priceOptions?.[0];

  const treatment: Treatment = {
    name,
    slug: raw.slug?.current || '',
    category: categorySlug,
    price: firstPrice ? `₩${firstPrice.price?.toLocaleString()}~` : '',
    priceNumeric: firstPrice?.price || 0,
    hasEvent: raw.isEvent || false,
    description: tagline,
    duration: raw.treatmentTime || '',
    anesthesia: raw.anesthesia?.[locale] || raw.anesthesia?.ko || '',
    recovery: raw.downtime || '',
    recommended: raw.duration || '',
  };

  return { category: categoryMeta, treatment };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category: categorySlug, slug } = await params;

  const cmsData = await getTreatmentDetail(slug, locale);
  const cmsResult = mapCmsTreatment(cmsData, locale, categorySlug);
  const result = cmsResult ?? getTreatmentBySlug(categorySlug, slug);
  if (!result) return {};

  const { treatment } = result;
  const title = `${treatment.name} ${treatment.price}`;
  const description = treatment.description;

  return {
    title,
    description,
    alternates: getAlternates(locale, `/treatments/${categorySlug}/${slug}`),
    openGraph: {
      title: `${treatment.name} | ${siteNames[locale] ?? siteNames.ko}`,
      description,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
  };
}

export function generateStaticParams() {
  return TREATMENT_CATEGORIES.flatMap((c) =>
    c.treatments.map((t) => ({ category: c.slug, slug: t.slug })),
  );
}

const INFO_ROW_KEYS: {
  key: 'duration' | 'anesthesia' | 'recovery' | 'recommended';
  tKey: string;
}[] = [
  { key: 'duration', tKey: 'duration' },
  { key: 'anesthesia', tKey: 'anesthesia' },
  { key: 'recovery', tKey: 'recovery' },
  { key: 'recommended', tKey: 'recommended' },
];

export default async function TreatmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category: categorySlug, slug } = await params;

  const cmsData = await getTreatmentDetail(slug, locale);
  const cmsResult = mapCmsTreatment(cmsData, locale, categorySlug);
  const result = cmsResult ?? getTreatmentBySlug(categorySlug, slug);

  if (!result) {
    notFound();
  }

  const { category, treatment } = result;
  const t = await getTranslations('treatments');
  const tc = await getTranslations('common');

  const baseUrl = 'https://forever-clinic-myeongdong.com';

  return (
    <>
      <JsonLd
        data={getTreatmentProductJsonLd(
          {
            name: treatment.name,
            description: treatment.description,
            price: treatment.priceNumeric,
            slug: treatment.slug,
            category: category.slug,
          },
          locale,
        )}
      />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: t('title'), url: `${baseUrl}/${locale}/treatments` },
          {
            name: category.label,
            url: `${baseUrl}/${locale}/treatments/${category.slug}`,
          },
          {
            name: treatment.name,
            url: `${baseUrl}/${locale}/treatments/${category.slug}/${treatment.slug}`,
          },
        ])}
      />
      <section className="bg-[#faf8f5]">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8 p-5 lg:flex-row lg:gap-12 lg:px-[120px] lg:py-16">
          {/* Left - Image */}
          <ImagePlaceholder
            label={treatment.name}
            variant="neutral"
            className="h-[260px] w-full shrink-0 rounded-[8px] lg:h-[500px] lg:flex-1"
          />

          {/* Right - Details */}
          <div className="flex flex-col lg:flex-1">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[12px] text-[#d4c8bd]">
              <Link
                href={`/${locale}/treatments`}
                className="transition-colors hover:text-[#a83c44]"
              >
                {t('title')}
              </Link>
              <span>/</span>
              <Link
                href={`/${locale}/treatments/${category.slug}`}
                className="transition-colors hover:text-[#a83c44]"
              >
                {category.label}
              </Link>
              <span>/</span>
              <span className="text-[#a83c44]">{treatment.name}</span>
            </nav>

            {/* Category */}
            <span className="mt-4 inline-flex self-start rounded-[4px] bg-[#faf8f5] px-1.5 py-0.5 text-[12px] font-medium text-[#a83c44]">
              {category.label}
            </span>

            {/* Name */}
            <h1 className="mt-3 text-[24px] font-bold text-[#2b2b2b] lg:text-[28px]">
              {treatment.name}
            </h1>

            {/* Description */}
            <p className="mt-4 text-[14px] leading-[1.7] text-[#666]">
              {treatment.description}
            </p>

            {/* Info Rows */}
            <div className="mt-8 space-y-0">
              {INFO_ROW_KEYS.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center border-b border-[#e6e6e6] py-3"
                >
                  <span className="w-[100px] shrink-0 text-[13px] text-[#808080]">
                    {t(row.tKey)}
                  </span>
                  <span className="text-forever-charcoal text-[14px]">
                    {treatment[row.key]}
                  </span>
                </div>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="mt-8 flex items-center justify-between">
              <span className="text-forever-charcoal text-[20px] font-bold lg:text-[24px]">
                {treatment.price}
              </span>
              <AddToCartButton
                treatmentSlug={treatment.slug}
                treatmentName={treatment.name}
                packageLabel={treatment.price}
                unitPrice={treatment.priceNumeric}
                category={category.slug}
                label={tc('addToEstimate')}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
