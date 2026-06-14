'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { locales, localeNames } from '@/lib/i18n/config';
import type { SectionVisibility } from '@/lib/data/visibility';

const ALL_TREATMENT_LINKS = [
  {
    slug: 'lifting-laser',
    visKey: 'catLiftingLaser',
    i18nKey: 'liftingLaser',
    href: '/treatments?cat=lifting-laser',
  },
  {
    slug: 'petit-lifting',
    visKey: 'catPetitLifting',
    i18nKey: 'petitLifting',
    href: '/treatments?cat=petit-lifting',
  },
  {
    slug: 'skincare',
    visKey: 'catSkincare',
    i18nKey: 'skincareCat',
    href: '/treatments?cat=skincare',
  },
  {
    slug: 'skin-booster',
    visKey: 'catSkinBooster',
    i18nKey: 'skinBooster',
    href: '/treatments?cat=skin-booster',
  },
  {
    slug: 'hair-removal',
    visKey: 'catHairRemoval',
    i18nKey: 'hairRemoval',
    href: '/treatments?cat=hair-removal',
  },
  {
    slug: 'anesthesia',
    visKey: 'catAnesthesia',
    i18nKey: 'anesthesia',
    href: '/treatments?cat=anesthesia',
  },
] as const;

const DEFAULT_TREATMENT_ORDER = ALL_TREATMENT_LINKS.map((l) => l.slug);

const ALL_MEDIA_LINKS = [
  { key: 'press', href: '/media/press' },
  { key: 'video', href: '/media/video' },
  { key: 'blog', href: '/media/blog' },
  { key: 'notice', href: '/media/notice' },
] as const;

const DEFAULT_MEDIA_ORDER = ALL_MEDIA_LINKS.map((l) => l.key);

// stats는 footer에 표시하지 않음
const ALL_BRAND_LINKS = [
  {
    key: 'philosophy',
    visKey: 'philosophy',
    i18nKey: 'brandPhilosophy',
    href: '/brand#philosophy',
  },
  {
    key: 'doctors',
    visKey: 'doctors',
    i18nKey: 'doctors',
    href: '/brand#doctors',
  },
  {
    key: 'facilities',
    visKey: 'facilities',
    i18nKey: 'facilities',
    href: '/brand#facilities',
  },
  {
    key: 'equipment',
    visKey: 'equipment',
    i18nKey: 'equipment',
    href: '/brand#equipment',
  },
  {
    key: 'location',
    visKey: 'location',
    i18nKey: 'location',
    href: '/brand#location',
  },
] as const;

const DEFAULT_BRAND_ORDER = ALL_BRAND_LINKS.map((l) => l.key);

interface FooterClinicInfo {
  clinicName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface FooterProps {
  locale?: string;
  clinicInfo?: FooterClinicInfo;
  navVisibility?: SectionVisibility['nav'];
  brandVisibility?: SectionVisibility['brand'];
  mediaVisibility?: SectionVisibility['media'];
  megaMenuOrder?: string[] | null;
  brandOrder?: string[] | null;
  mediaOrder?: string[] | null;
}

export function Footer({
  locale = 'ko',
  clinicInfo,
  navVisibility,
  brandVisibility,
  mediaVisibility,
  megaMenuOrder,
  brandOrder,
  mediaOrder,
}: FooterProps) {
  const t = useTranslations('footer');
  const pathname = usePathname();

  // 현재 경로의 로케일 세그먼트만 교체. 실제 <a href>로 항상 렌더해
  // 4개 언어 버전이 정적 DOM에서 서로를 가리키게 함(색인 안정성의 핵심).
  const localeHref = (target: string) => {
    const segments = pathname.split('/');
    segments[1] = target;
    return segments.join('/') || `/${target}`;
  };

  // Treatment categories: apply order + visibility filter
  const orderedTreatmentSlugs = megaMenuOrder?.length
    ? [
        ...megaMenuOrder.filter((k) =>
          DEFAULT_TREATMENT_ORDER.includes(
            k as (typeof DEFAULT_TREATMENT_ORDER)[number],
          ),
        ),
        ...DEFAULT_TREATMENT_ORDER.filter((k) => !megaMenuOrder.includes(k)),
      ]
    : DEFAULT_TREATMENT_ORDER;
  const visibleTreatmentLinks = orderedTreatmentSlugs
    .map((slug) => ALL_TREATMENT_LINKS.find((l) => l.slug === slug))
    .filter((l): l is (typeof ALL_TREATMENT_LINKS)[number] => l !== undefined)
    .filter((l) => !navVisibility || navVisibility[l.visKey] !== false);

  // Brand links: apply order + visibility filter (stats excluded)
  const orderedBrandKeys = brandOrder?.length
    ? [
        ...brandOrder.filter((k) =>
          DEFAULT_BRAND_ORDER.includes(
            k as (typeof DEFAULT_BRAND_ORDER)[number],
          ),
        ),
        ...DEFAULT_BRAND_ORDER.filter((k) => !brandOrder.includes(k)),
      ]
    : DEFAULT_BRAND_ORDER;
  const visibleBrandLinks = orderedBrandKeys
    .map((key) => ALL_BRAND_LINKS.find((l) => l.key === key))
    .filter((l): l is (typeof ALL_BRAND_LINKS)[number] => l !== undefined)
    .filter((l) => !brandVisibility || brandVisibility[l.visKey] !== false);

  // Media tabs: apply order + visibility filter
  const orderedMediaKeys = mediaOrder?.length
    ? [
        ...mediaOrder.filter((k) =>
          DEFAULT_MEDIA_ORDER.includes(
            k as (typeof DEFAULT_MEDIA_ORDER)[number],
          ),
        ),
        ...DEFAULT_MEDIA_ORDER.filter((k) => !mediaOrder.includes(k)),
      ]
    : DEFAULT_MEDIA_ORDER;
  const visibleMediaLinks = orderedMediaKeys
    .map((key) => ALL_MEDIA_LINKS.find((l) => l.key === key))
    .filter((l): l is (typeof ALL_MEDIA_LINKS)[number] => l !== undefined)
    .filter((l) => !mediaVisibility || mediaVisibility[l.key] !== false);

  return (
    <footer className="bg-[#181818]">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-8 md:px-12">
        {/* 4-column flex layout matching Figma */}
        <div className="flex flex-col gap-10 md:flex-row md:gap-12">
          {/* Column 1: Clinic Info */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="text-[16px] leading-normal font-bold tracking-[1.5px] whitespace-pre-line text-white">
              {clinicInfo?.clinicName ? (
                <p>{clinicInfo.clinicName}</p>
              ) : (
                <>
                  <p>{t('clinicNameLine1')}</p>
                  <p>{t('clinicNameLine2')}</p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-0.5 text-[13px] leading-[22px] text-[#706263]">
              <p>{clinicInfo?.address || t('clinicAddress')}</p>
              <p>{clinicInfo?.phone || t('clinicPhone')}</p>
              <p>{clinicInfo?.email || t('clinicEmail')}</p>
            </div>
          </div>

          {/* Column 2: Treatments */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-[14px] font-bold text-white">
              {t('treatments')}
            </span>
            {visibleTreatmentLinks.map(({ i18nKey, href }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-[13px] text-[#706263] transition-colors hover:text-white"
                data-ga-id={`footer.link-${href}`}
              >
                {t(i18nKey)}
              </Link>
            ))}
          </div>

          {/* Column 3: Brand */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-[14px] font-bold text-white">
              {t('brand')}
            </span>
            {visibleBrandLinks.map(({ i18nKey, href }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-[13px] text-[#706263] transition-colors hover:text-white"
                data-ga-id={`footer.link-${href}`}
              >
                {t(i18nKey)}
              </Link>
            ))}
          </div>

          {/* Column 4: Media */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-[14px] font-bold text-white">
              {t('media')}
            </span>
            {visibleMediaLinks.map(({ key, href }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-[13px] text-[#706263] transition-colors hover:text-white"
                data-ga-id={`footer.link-${href}`}
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </div>

        {/* 언어 전환 — 4개 언어 버전 상호 내부링크 (항상 정적 DOM에 렌더) */}
        <nav
          aria-label="Language"
          className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          <span className="text-[12px] font-bold tracking-wide text-white">
            LANGUAGE
          </span>
          {locales.map((l) => (
            <Link
              key={l}
              href={localeHref(l)}
              hrefLang={l}
              className={cn(
                'text-[13px] transition-colors hover:text-white',
                l === locale ? 'font-semibold text-white' : 'text-[#706263]',
              )}
              data-ga-id={`footer.lang-${l}`}
            >
              {localeNames[l]}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-[rgba(112,98,99,0.3)]" />

        {/* Copyright row */}
        <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <p className="text-[12px] text-[#706263]">{t('copyright')}</p>
          <div className="flex gap-3">
            <Link
              href={`/${locale}/terms`}
              className="text-[12px] text-[#706263] transition-colors hover:text-white"
              data-ga-id="footer.link-terms"
            >
              {t('terms')}
            </Link>
            <Link
              href={`/${locale}/privacy`}
              className="text-[12px] text-[#706263] transition-colors hover:text-white"
              data-ga-id="footer.link-privacy"
            >
              {t('privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
