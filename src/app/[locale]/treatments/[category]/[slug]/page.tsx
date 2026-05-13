import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  TREATMENT_CATEGORIES,
  getTreatmentBySlug,
  type Treatment,
  type TreatmentCategory,
} from '@/components/treatments/treatmentData';
import { getTreatmentDetail } from '@/lib/data/treatments';
import { AddToCartButton } from '@/components/treatments/AddToCartButton';
import { TreatmentFAQ } from '@/components/treatments/TreatmentFAQ';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  getTreatmentProductJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/seo/jsonld';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { getSectionVisibility } from '@/lib/data/visibility';

const CLINIC_NAMES: Record<string, string> = {
  ko: '포에버의원',
  en: 'Forever Clinic',
  zh: '博爱医院',
  ja: 'フォーエバークリニック',
};

function getCategoryLabel(category: TreatmentCategory, locale: string): string {
  if (locale === 'zh') return category.labelZh ?? category.label;
  if (locale === 'ja') return category.labelJa ?? category.label;
  if (locale === 'en') return category.labelEn ?? category.label;
  return category.label;
}

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

// localizedString 배열에서 현재 로케일 텍스트 추출
function extractLocalizedArray(arr: unknown, locale: string): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        const o = item as Record<string, unknown>;
        return String(o[locale] ?? o['ko'] ?? '');
      }
      return '';
    })
    .filter(Boolean);
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category: categorySlug, slug } = await params;

  const cmsData = (await getTreatmentDetail(slug, locale)) as any;
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

  const visibility = await getSectionVisibility();
  if (!visibility.nav.treatments) {
    redirect(`/${locale}`);
  }
  if (!visibility.treatments.detail) {
    redirect(`/${locale}/treatments`);
  }

  const cmsData = (await getTreatmentDetail(slug, locale)) as any;
  const cmsResult = mapCmsTreatment(cmsData, locale, categorySlug);
  const result = cmsResult ?? getTreatmentBySlug(categorySlug, slug);

  if (!result) {
    notFound();
  }

  const { category, treatment } = result;
  const t = await getTranslations('treatments');
  const tc = await getTranslations('common');

  // 새 콘텐츠 섹션 데이터 (raw Sanity에서 직접 추출)
  const descriptionText = cmsData
    ? extractLocale(cmsData.description, locale)
    : '';
  const features = cmsData
    ? extractLocalizedArray(cmsData.features, locale)
    : [];
  const recommendedFor = cmsData
    ? extractLocalizedArray(cmsData.recommendedFor, locale)
    : [];
  const procedureSteps = cmsData
    ? extractLocalizedArray(cmsData.procedure, locale)
    : [];
  const precautions = cmsData
    ? extractLocalizedArray(cmsData.precautions, locale)
    : [];
  const faqItems: { q: string; a: string }[] = cmsData?.faq
    ? (cmsData.faq as any[]).map((item: any) => ({
        q: extractLocale(item.question as unknown, locale),
        a: extractLocale(item.answer as unknown, locale),
      }))
    : [];
  /* eslint-enable @typescript-eslint/no-explicit-any */

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
            name: getCategoryLabel(category, locale),
            url: `${baseUrl}/${locale}/treatments/${category.slug}`,
          },
          {
            name: treatment.name,
            url: `${baseUrl}/${locale}/treatments/${category.slug}/${treatment.slug}`,
          },
        ])}
      />
      <section className="bg-[#faf8f5]">
        <div className="mx-auto flex max-w-[680px] flex-col gap-0 px-5 py-5 lg:max-w-[var(--container-max)] lg:flex-row lg:px-[120px] lg:py-16">
          {/* Left - Title */}
          <div className="flex flex-col lg:w-[340px] lg:shrink-0 lg:pr-12">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-[#d4c8bd]">
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
                {getCategoryLabel(category, locale)}
              </Link>
              <span>/</span>
              <span className="text-[#a83c44]">{treatment.name}</span>
            </nav>

            {/* Category + badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex self-start rounded-[4px] bg-white px-1.5 py-0.5 text-[12px] font-medium text-[#a83c44]">
                {getCategoryLabel(category, locale)}
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
            <h1 className="mt-3 text-[24px] font-bold break-words text-[#2b2b2b] lg:text-[28px]">
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
          <div className="mt-5 flex flex-col border-[#e6e6e6] lg:mt-0 lg:flex-1 lg:border-l lg:pt-0 lg:pl-12">
            {/* Composition (signature only) */}
            {treatment.hasSignature && treatment.composition && (
              <div className="mb-6 rounded-[8px] border border-[#efe5d9] bg-white p-4">
                <p className="mb-1.5 text-[11px] font-semibold tracking-[0.15em] text-[#a83c44] uppercase">
                  Composition
                </p>
                <p className="text-[13px] leading-[1.8] text-[#2b2b2b]">
                  {treatment.composition}
                </p>
              </div>
            )}

            {/* Info Rows */}
            <div className="space-y-0 border-t border-[#e6e6e6]">
              {INFO_ROW_KEYS.filter((row) => treatment[row.key]).map((row) => (
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

            {/* CTA */}
            <div className="mt-auto flex justify-end pt-6">
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

      {/* ── 시술 소개 ── */}
      {descriptionText && (
        <section className="bg-white py-12">
          <div className="mx-auto w-full max-w-[680px] px-5">
            <p className="text-[11px] font-medium tracking-[0.15em] text-[#a83c44] uppercase">
              {CLINIC_NAMES[locale] ?? CLINIC_NAMES.ko}
            </p>
            <h2 className="mt-1 text-[20px] font-bold text-[#2b2b2b]">
              {t('description')}
            </h2>
            <div className="mt-4 h-px w-full bg-[#e6e6e6]" />
            <p className="mt-6 text-[14px] leading-[1.8] text-[#555]">
              {descriptionText}
            </p>
          </div>
        </section>
      )}

      {/* ── 이런 변화를 기대할 수 있어요 ── */}
      {features.length > 0 && (
        <section className="bg-[#faf8f5] py-12">
          <div className="mx-auto w-full max-w-[680px] px-5">
            <p className="text-[11px] font-medium tracking-[0.15em] text-[#a83c44] uppercase">
              {CLINIC_NAMES[locale] ?? CLINIC_NAMES.ko}
            </p>
            <h2 className="mt-1 text-[20px] font-bold text-[#2b2b2b]">
              {t('features')}
            </h2>
            <div className="mt-4 h-px w-full bg-[#e6e6e6]" />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-[12px] border border-[#e6e6e6] bg-white p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2b2b2b] text-[13px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-[14px] leading-[1.7] text-[#2b2b2b]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 이런 고민이 있다면 ── */}
      {recommendedFor.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto w-full max-w-[680px] px-5">
            <p className="text-[11px] font-medium tracking-[0.15em] text-[#a83c44] uppercase">
              {CLINIC_NAMES[locale] ?? CLINIC_NAMES.ko}
            </p>
            <h2 className="mt-1 text-[20px] font-bold text-[#2b2b2b]">
              {t('recommendedFor')}
            </h2>
            <div className="mt-4 h-px w-full bg-[#e6e6e6]" />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recommendedFor.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-[12px] border border-[#e6e6e6] bg-white p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2b2b2b]">
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <path
                        d="M5 10l4 4 6-6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[14px] leading-[1.7] text-[#2b2b2b]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 시술 과정 ── */}
      {procedureSteps.length > 0 && (
        <section className="bg-[#faf8f5] py-12">
          <div className="mx-auto w-full max-w-[680px] px-5">
            <p className="text-[11px] font-medium tracking-[0.15em] text-[#a83c44] uppercase">
              {CLINIC_NAMES[locale] ?? CLINIC_NAMES.ko}
            </p>
            <h2 className="mt-1 text-[20px] font-bold text-[#2b2b2b]">
              {t('procedure')}
            </h2>
            <div className="mt-4 h-px w-full bg-[#e6e6e6]" />
            <ol className="mt-6 space-y-3">
              {procedureSteps.map((step, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a83c44] text-[13px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-[14px] leading-[1.7] text-[#444]">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── 자주 묻는 질문 ── */}
      {faqItems.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto w-full max-w-[680px] px-5">
            <p className="text-[11px] font-medium tracking-[0.15em] text-[#a83c44] uppercase">
              {CLINIC_NAMES[locale] ?? CLINIC_NAMES.ko}
            </p>
            <h2 className="mt-1 text-[20px] font-bold text-[#2b2b2b]">
              {t('faq')}
            </h2>
            <div className="mt-4 h-px w-full bg-[#e6e6e6]" />
            <div className="mt-6">
              <TreatmentFAQ items={faqItems} />
            </div>
          </div>
        </section>
      )}

      {/* ── 주의사항 ── */}
      {precautions.length > 0 && (
        <section className="bg-[#faf8f5] py-12">
          <div className="mx-auto w-full max-w-[680px] px-5">
            <p className="text-[11px] font-medium tracking-[0.15em] text-[#a83c44] uppercase">
              {CLINIC_NAMES[locale] ?? CLINIC_NAMES.ko}
            </p>
            <h2 className="mt-1 text-[20px] font-bold text-[#2b2b2b]">
              {t('precautions')}
            </h2>
            <div className="mt-4 h-px w-full bg-[#e6e6e6]" />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {precautions.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-[12px] border border-[#e6e6e6] bg-white p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#a83c44]">
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <path
                        d="M5 10l4 4 6-6"
                        stroke="#a83c44"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[14px] leading-[1.7] text-[#555]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
