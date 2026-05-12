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
import { AddToCartButton } from '@/components/treatments/AddToCartButton';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  getTreatmentProductJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/seo/jsonld';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Sanity에서 string 또는 localizedString 객체 모두 처리
function extractLocale(field: unknown, locale: string): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    const f = field as Record<string, unknown>;
    return String(f[locale] ?? f['ko'] ?? '');
  }
  return '';
}

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
  const description =
    raw.description?.[locale] || raw.description?.ko || tagline;
  const firstPrice = raw.priceOptions?.[0];
  const effectivePrice = firstPrice?.discountPrice ?? firstPrice?.price;

  const treatment: Treatment = {
    name,
    slug: raw.slug?.current || '',
    category: categorySlug,
    price: effectivePrice ? `₩${effectivePrice.toLocaleString()}` : '',
    priceNumeric: effectivePrice || 0,
    hasEvent: raw.isEvent || false,
    hasSignature: raw.isSignature || false,
    originalPriceNumeric: firstPrice?.price || 0,
    discountRate:
      firstPrice?.price && firstPrice?.discountPrice
        ? Math.round((1 - firstPrice.discountPrice / firstPrice.price) * 100)
        : 0,
    keywords: raw.keywords?.[locale] || raw.keywords?.ko || '',
    composition: raw.composition?.[locale] || raw.composition?.ko || '',
    description,
    duration: extractLocale(raw.treatmentTime, locale),
    anesthesia: raw.anesthesia?.[locale] || raw.anesthesia?.ko || '',
    recovery: extractLocale(raw.downtime, locale),
    recommended: raw.duration || '',
    imageUrl: raw.imageUrl || undefined,
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

export const dynamic = 'force-dynamic';

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
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-0 p-5 lg:flex-row lg:px-[120px] lg:py-16">
          {/* Left - Title */}
          <div className="flex flex-col lg:w-[340px] lg:shrink-0 lg:pr-12">
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
                href={`/${locale}/treatments?cat=${category.slug}`}
                className="transition-colors hover:text-[#a83c44]"
              >
                {category.label}
              </Link>
              <span>/</span>
              <span className="text-[#a83c44]">{treatment.name}</span>
            </nav>

            {/* Category + badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex self-start rounded-[4px] bg-white px-1.5 py-0.5 text-[12px] font-medium text-[#a83c44]">
                {category.label}
              </span>
              {treatment.hasEvent && (
                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#a83c44] px-1.5 py-0.5 text-[12px] font-bold text-white">
                  EVENT
                </span>
              )}
              {(treatment.hasSignature || treatment.hasEvent) &&
                (treatment.discountRate ?? 0) > 0 && (
                  <span className="inline-flex rounded-[4px] bg-[#2b2b2b] px-1.5 py-0.5 text-[12px] font-bold text-white">
                    {treatment.discountRate}% OFF
                  </span>
                )}
            </div>

            {/* Name */}
            <h1 className="mt-3 text-[24px] font-bold text-[#2b2b2b] lg:text-[28px]">
              {treatment.name}
            </h1>

            {/* Keywords (signature only) */}
            {treatment.hasSignature && treatment.keywords && (
              <p className="mt-2 text-[13px] text-[#999]">
                {treatment.keywords}
              </p>
            )}

            {/* Price */}
            <div className="mt-8 lg:mt-auto lg:pt-8">
              {(treatment.hasSignature || treatment.hasEvent) &&
              (treatment.discountRate ?? 0) > 0 ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-[#999] line-through">
                    ₩{treatment.originalPriceNumeric?.toLocaleString()}
                  </span>
                  <span className="text-[22px] font-bold text-[#a83c44] lg:text-[26px]">
                    {treatment.price}
                  </span>
                </div>
              ) : (
                <span className="text-forever-charcoal text-[20px] font-bold lg:text-[24px]">
                  {treatment.price}
                </span>
              )}
            </div>
          </div>

          {/* Right - Content */}
          <div className="mt-8 flex flex-col border-t border-[#e6e6e6] pt-8 lg:mt-0 lg:flex-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
            {/* Description + CTA */}
            <div className="flex items-start justify-between gap-4">
              <p className="flex-1 text-[14px] leading-[1.7] text-[#666]">
                {treatment.description}
              </p>
              <div className="shrink-0">
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

            {/* Composition (signature only) */}
            {treatment.hasSignature && treatment.composition && (
              <div className="mt-6 rounded-[8px] border border-[#efe5d9] bg-white p-4">
                <p className="mb-1.5 text-[11px] font-semibold tracking-[0.15em] text-[#a83c44] uppercase">
                  Composition
                </p>
                <p className="text-[13px] leading-[1.8] text-[#2b2b2b]">
                  {treatment.composition}
                </p>
              </div>
            )}

            {/* Info Rows */}
            <div className="mt-6 space-y-0">
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
          </div>
        </div>
      </section>
    </>
  );
}
