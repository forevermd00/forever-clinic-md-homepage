'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

/* Treatment links - i18n keys (6개 카테고리, 2026-05-07 기준) */
const treatmentLinkKeys = [
  { key: 'liftingLaser', href: '/treatments?cat=lifting-laser' },
  { key: 'petitLifting', href: '/treatments?cat=petit-lifting' },
  { key: 'skincareCat', href: '/treatments?cat=skincare' },
  { key: 'skinBooster', href: '/treatments?cat=skin-booster' },
  { key: 'hairRemoval', href: '/treatments?cat=hair-removal' },
  { key: 'anesthesia', href: '/treatments?cat=anesthesia' },
] as const;

/* Brand links use i18n keys */
const brandLinkKeys = [
  { key: 'brandPhilosophy', href: '/brand#philosophy' },
  { key: 'doctors', href: '/brand#doctors' },
  { key: 'facilities', href: '/brand#facilities' },
  { key: 'equipment', href: '/brand#equipment' },
  { key: 'location', href: '/brand#location' },
] as const;

/* Media links use i18n keys */
const mediaLinkKeys = [
  { key: 'press', href: '/media/press' },
  { key: 'video', href: '/media/video' },
  { key: 'blog', href: '/media/blog' },
  { key: 'notice', href: '/media/notice' },
] as const;

interface FooterClinicInfo {
  address?: string;
  phone?: string;
  email?: string;
}

interface FooterProps {
  locale?: string;
  clinicInfo?: FooterClinicInfo;
}

export function Footer({ locale = 'ko', clinicInfo }: FooterProps) {
  const t = useTranslations('footer');

  return (
    <footer className="bg-[#181818]">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-8 md:px-12">
        {/* 4-column flex layout matching Figma */}
        <div className="flex flex-col gap-10 md:flex-row md:gap-12">
          {/* Column 1: Clinic Info */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="text-[16px] leading-normal font-bold tracking-[1.5px] text-white">
              <p>{t('clinicNameLine1')}</p>
              <p>{t('clinicNameLine2')}</p>
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
            {treatmentLinkKeys.map(({ key, href }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-[13px] text-[#706263] transition-colors hover:text-white"
              >
                {t(key)}
              </Link>
            ))}
          </div>

          {/* Column 3: Brand */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-[14px] font-bold text-white">
              {t('brand')}
            </span>
            {brandLinkKeys.map(({ key, href }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-[13px] text-[#706263] transition-colors hover:text-white"
              >
                {t(key)}
              </Link>
            ))}
          </div>

          {/* Column 4: Media */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-[14px] font-bold text-white">
              {t('media')}
            </span>
            {mediaLinkKeys.map(({ key, href }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-[13px] text-[#706263] transition-colors hover:text-white"
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-[rgba(112,98,99,0.3)]" />

        {/* Copyright row */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <p className="text-[12px] text-[#706263]">{t('copyright')}</p>
            <div className="flex gap-3">
              <Link
                href={`/${locale}/terms`}
                className="text-[12px] text-[#706263] transition-colors hover:text-white"
              >
                {t('terms')}
              </Link>
              <Link
                href={`/${locale}/privacy`}
                className="text-[12px] text-[#706263] transition-colors hover:text-white"
              >
                {t('privacy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
