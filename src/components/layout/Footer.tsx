'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

/* Treatment links - i18n keys */
const treatmentLinkKeys = [
  { key: 'lifting', href: '/treatments/lifting' },
  { key: 'skincare', href: '/treatments/skincare' },
  { key: 'toningSkin', href: '/treatments/toning' },
  { key: 'botoxFiller', href: '/treatments/botox-filler' },
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

const snsIcons = [
  { label: 'IG', title: 'Instagram' },
  { label: 'YT', title: 'YouTube' },
  { label: 'WC', title: 'WeChat' },
  { label: 'B', title: 'Blog' },
];

interface FooterProps {
  locale?: string;
}

export function Footer({ locale = 'ko' }: FooterProps) {
  const t = useTranslations('footer');

  return (
    <footer className="bg-[#2b2b2b]">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-8 md:px-12">
        {/* 4-column flex layout matching Figma */}
        <div className="flex flex-col gap-10 md:flex-row md:gap-12">
          {/* Column 1: Clinic Info */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="text-[16px] leading-normal font-bold tracking-[1.5px] text-white">
              <p>FOREVER CLINIC</p>
              <p>MYEONGDONG</p>
            </div>
            {/* TODO: Clinic info should come from CMS (clinicInfo) */}
            <div className="flex flex-col gap-0.5 text-[13px] leading-[22px] text-[#706263]">
              <p>{t('clinicAddress')}</p>
              <p>{t('clinicPhone')}</p>
              <p>{t('clinicEmail')}</p>
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
          <p className="text-[12px] text-[#706263]">{t('copyright')}</p>
          <div className="flex gap-2.5">
            {snsIcons.map(({ label, title }) => (
              <span
                key={label}
                title={title}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-[11px] font-medium tracking-[0.5px] text-white/60 transition-colors hover:border-white/40 hover:text-white"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
