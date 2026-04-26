'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';
import { CartBadge } from '@/components/layout/CartBadge';

/* ----------------------------------------------------------------
   Megamenu data — full sitemap columns
   ---------------------------------------------------------------- */
const allColumns = [
  {
    group: 'ba',
    title: 'Before & After',
    href: '/before-after',
    items: [
      { label: '전체 보기', href: '/before-after' },
      { label: '리프팅', href: '/before-after?cat=lifting' },
      { label: '피부케어', href: '/before-after?cat=skincare' },
      { label: '토닝/색소', href: '/before-after?cat=toning' },
      { label: '보톡스/필러', href: '/before-after?cat=botox' },
    ],
    dividerAfter: true,
  },
  {
    group: 'treatments',
    title: '리프팅',
    href: '/treatments/lifting',
    items: [
      { label: '울쎄라 리프팅', href: '/treatments/lifting/ulthera' },
      { label: '써마지 FLX', href: '/treatments/lifting/thermage' },
      { label: '실리프팅', href: '/treatments/lifting/thread' },
      { label: 'HIFU', href: '/treatments/lifting/hifu' },
      { label: '슈링크', href: '/treatments/lifting/shrink' },
    ],
  },
  {
    group: 'treatments',
    title: '피부케어',
    href: '/treatments/skincare',
    items: [
      { label: '물광주사', href: '/treatments/skincare/mulkwang' },
      { label: '스킨부스터', href: '/treatments/skincare/booster' },
      { label: '엑소좀', href: '/treatments/skincare/exosome' },
      { label: '리쥬란', href: '/treatments/skincare/rejuran' },
      { label: 'PRP', href: '/treatments/skincare/prp' },
    ],
  },
  {
    group: 'treatments',
    title: '토닝/색소',
    href: '/treatments/toning',
    items: [
      { label: '피코레이저', href: '/treatments/toning/pico' },
      { label: 'IPL 토닝', href: '/treatments/toning/ipl' },
      { label: '색소레이저', href: '/treatments/toning/pigment' },
      { label: '여드름관리', href: '/treatments/toning/acne' },
      { label: '흉터치료', href: '/treatments/toning/scar' },
    ],
  },
  {
    group: 'treatments',
    title: '보톡스/필러',
    href: '/treatments/botox-filler',
    items: [
      { label: '보톡스', href: '/treatments/botox-filler/botox' },
      { label: '필러', href: '/treatments/botox-filler/filler' },
      { label: '스킨보톡스', href: '/treatments/botox-filler/skin-botox' },
      { label: '턱보톡스', href: '/treatments/botox-filler/jaw' },
      { label: '코필러', href: '/treatments/botox-filler/nose' },
    ],
  },
  {
    group: 'treatments',
    title: '이벤트',
    href: '/promotions',
    items: [
      { label: '봄맞이 리프팅 특가', href: '/promotions' },
      { label: '신규 고객 보톡스 패키지', href: '/promotions' },
      { label: '울쎄라+써마지 콤보', href: '/promotions' },
      { label: '이달의 피부케어 세트', href: '/promotions' },
    ],
    dividerAfter: true,
  },
  {
    group: 'brand',
    title: '브랜드',
    href: '/brand',
    items: [
      { label: '브랜드 철학', href: '/brand#philosophy' },
      { label: '의료진 소개', href: '/brand#doctors' },
      { label: '시설 안내', href: '/brand#facilities' },
      { label: '장비 안내', href: '/brand#equipment' },
      { label: '오시는 길', href: '/brand#location' },
    ],
    dividerAfter: true,
  },
  {
    group: 'media',
    title: '미디어',
    href: '/media',
    items: [
      { label: '보도자료', href: '/media/press' },
      { label: '영상', href: '/media/video' },
      { label: '블로그', href: '/media/blog' },
      { label: '공지사항', href: '/media/notice' },
    ],
  },
];

/* Nav items with group mapping — label is a translation key under "nav" namespace */
const navItems = [
  { labelKey: 'beforeAfter', href: '/before-after', group: 'ba' },
  { labelKey: 'treatments', href: '/treatments', group: 'treatments' },
  { labelKey: 'brand', href: '/brand', group: 'brand' },
  { labelKey: 'media', href: '/media', group: 'media' },
] as const;

/* Shared column renderer */
function MegaColumn({
  col,
  locale,
}: {
  col: (typeof allColumns)[number];
  locale: string;
}) {
  return (
    <div className="flex flex-col pr-4 lg:pr-6">
      <Link
        href={`/${locale}${col.href}`}
        className="pb-3 text-[13px] font-bold text-[#a83c44]"
      >
        {col.title}
      </Link>
      <div className="mb-2 h-px w-[120px] bg-[#d9cfc5]" />
      {col.items.map((item) => (
        <Link
          key={item.label}
          href={`/${locale}${item.href}`}
          className="py-[5px] text-[13px] text-[#555] transition-colors hover:text-[#a83c44]"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] as Locale;
  const router = useRouter();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [isLg, setIsLg] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100);
    const onResize = () => setIsLg(window.innerWidth >= 1280);
    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setIsMobileMenuOpen(false);
      setHoveredGroup(null);
      setExpandedMenu(null);
      setExpandedCategory(null);
    }
  }, [pathname]);

  const openMega = (group: string) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setHoveredGroup(group);
  };
  const closeMega = () => {
    megaTimeout.current = setTimeout(() => setHoveredGroup(null), 200);
  };

  const switchLocale = (locale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
    setIsLangOpen(false);
  };

  const isMegaOpen = hoveredGroup !== null;
  const filteredColumns = allColumns.filter(
    (col) => col.group === hoveredGroup,
  );

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 bg-white transition-shadow duration-200',
          isScrolled && 'shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
        )}
      >
        {/* Top bar */}
        <div className="border-b border-[#efe5d9]">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-12">
            <Link
              href={`/${currentLocale}`}
              className="text-[18px] font-bold tracking-[2px] text-[#2b2b2b]"
            >
              FOREVER CLINIC
            </Link>

            <nav
              className="hidden items-center gap-8 md:flex"
              aria-label="main"
            >
              {navItems.map(({ labelKey, href, group }) => (
                <Link
                  key={href}
                  href={`/${currentLocale}${href}`}
                  className={cn(
                    'py-5 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:text-[#a83c44]',
                    hoveredGroup === group && 'text-[#a83c44]',
                  )}
                  onMouseEnter={() => openMega(group)}
                  onMouseLeave={closeMega}
                >
                  {tNav(labelKey)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-[#2b2b2b]"
                  aria-label="Change language"
                >
                  {localeNames[currentLocale]}{' '}
                  <span className="text-[10px]">▾</span>
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-1 overflow-hidden rounded-[4px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                    {locales.map((locale) => (
                      <button
                        key={locale}
                        onClick={() => switchLocale(locale)}
                        className={cn(
                          'block w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-neutral-100',
                          locale === currentLocale
                            ? 'font-semibold text-[#a83c44]'
                            : 'text-[#2b2b2b]',
                        )}
                      >
                        {localeNames[locale]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href={`/${currentLocale}/estimate`}
                className="relative hidden text-[16px] text-[#2b2b2b] md:inline-flex"
                aria-label="Cart"
              >
                🛒
                <CartBadge />
              </Link>

              <Link
                href={`/${currentLocale}/contact`}
                className="hidden rounded-[4px] bg-[#a83c44] px-4 py-2 text-[13px] text-white transition-colors hover:bg-[#8c2e38] md:inline-flex"
              >
                {tCommon('reservation')}
              </Link>

              <button
                className="flex size-10 items-center justify-center md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="space-y-1.5">
                  <span
                    className={cn(
                      'block h-0.5 w-5 bg-[#2b2b2b] transition-transform',
                      isMobileMenuOpen && 'translate-y-2 rotate-45',
                    )}
                  />
                  <span
                    className={cn(
                      'block h-0.5 w-5 bg-[#2b2b2b] transition-opacity',
                      isMobileMenuOpen && 'opacity-0',
                    )}
                  />
                  <span
                    className={cn(
                      'block h-0.5 w-5 bg-[#2b2b2b] transition-transform',
                      isMobileMenuOpen && '-translate-y-2 -rotate-45',
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        {isMegaOpen && (
          <div
            className="hidden bg-[#faf8f5] md:block"
            onMouseEnter={() => {
              if (megaTimeout.current) clearTimeout(megaTimeout.current);
            }}
            onMouseLeave={closeMega}
          >
            <div className="mx-auto flex max-w-[1440px] items-start justify-center overflow-x-auto px-8 py-9 lg:px-16">
              {(isLg ? allColumns : filteredColumns).map((col, i, arr) => (
                <div key={col.title} className="flex shrink-0 items-start">
                  <MegaColumn col={col} locale={currentLocale} />
                  {isLg
                    ? col.dividerAfter &&
                      i < arr.length - 1 && (
                        <div className="mx-6 h-[200px] w-px bg-[#d9cfc5]" />
                      )
                    : i < arr.length - 1 && (
                        <div className="mx-4 h-[180px] w-px bg-[#d9cfc5]" />
                      )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-white pt-16 md:hidden">
          <nav className="flex flex-col px-6 py-8">
            {/* Before & After */}
            <div className="flex items-center">
              <Link
                href={`/${currentLocale}/before-after`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex-1 py-3.5 text-[16px] font-medium',
                  expandedMenu === 'ba' ? 'text-[#a83c44]' : 'text-[#2b2b2b]',
                )}
              >
                {tNav('beforeAfter')}
              </Link>
              <button
                onClick={() => {
                  setExpandedMenu(expandedMenu === 'ba' ? null : 'ba');
                  setExpandedCategory(null);
                }}
                className="flex h-12 w-12 items-center justify-center text-[14px] text-[#706263]"
              >
                {expandedMenu === 'ba' ? '▾' : '▸'}
              </button>
            </div>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                expandedMenu === 'ba' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden pl-4">
                {allColumns
                  .filter((c) => c.group === 'ba')
                  .flatMap((c) => c.items)
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={`/${currentLocale}${item.href}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-[13px] text-[#706263]"
                    >
                      {item.label}
                    </Link>
                  ))}
              </div>
            </div>

            {/* 시술 */}
            <div className="flex items-center">
              <Link
                href={`/${currentLocale}/treatments`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex-1 py-3.5 text-[16px] font-medium',
                  expandedMenu === 'treatments'
                    ? 'text-[#a83c44]'
                    : 'text-[#2b2b2b]',
                )}
              >
                {tNav('treatments')}
              </Link>
              <button
                onClick={() => {
                  setExpandedMenu(
                    expandedMenu === 'treatments' ? null : 'treatments',
                  );
                  setExpandedCategory(null);
                }}
                className="flex h-12 w-12 items-center justify-center text-[14px] text-[#706263]"
              >
                {expandedMenu === 'treatments' ? '▾' : '▸'}
              </button>
            </div>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                expandedMenu === 'treatments'
                  ? 'grid-rows-[1fr]'
                  : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden pl-4">
                {allColumns
                  .filter((c) => c.group === 'treatments')
                  .map((cat) => (
                    <div key={cat.title}>
                      <div className="flex items-center">
                        <Link
                          href={`/${currentLocale}${cat.href}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'flex-1 py-2.5 text-[14px] font-bold',
                            expandedCategory === cat.title
                              ? 'text-[#a83c44]'
                              : 'text-[#2b2b2b]',
                          )}
                        >
                          {cat.title}
                        </Link>
                        <button
                          onClick={() =>
                            setExpandedCategory(
                              expandedCategory === cat.title ? null : cat.title,
                            )
                          }
                          className="flex h-10 w-12 items-center justify-center text-[12px] text-[#706263]"
                        >
                          {expandedCategory === cat.title ? '▾' : '▸'}
                        </button>
                      </div>
                      <div
                        className={cn(
                          'grid transition-[grid-template-rows] duration-300 ease-out',
                          expandedCategory === cat.title
                            ? 'grid-rows-[1fr]'
                            : 'grid-rows-[0fr]',
                        )}
                      >
                        <div className="overflow-hidden pl-4">
                          {cat.items.map((item) => (
                            <Link
                              key={item.href}
                              href={`/${currentLocale}${item.href}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-2 text-[13px] text-[#706263]"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 브랜드 */}
            <div className="flex items-center">
              <Link
                href={`/${currentLocale}/brand`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex-1 py-3.5 text-[16px] font-medium',
                  expandedMenu === 'brand'
                    ? 'text-[#a83c44]'
                    : 'text-[#2b2b2b]',
                )}
              >
                {tNav('brand')}
              </Link>
              <button
                onClick={() => {
                  setExpandedMenu(expandedMenu === 'brand' ? null : 'brand');
                  setExpandedCategory(null);
                }}
                className="flex h-12 w-12 items-center justify-center text-[14px] text-[#706263]"
              >
                {expandedMenu === 'brand' ? '▾' : '▸'}
              </button>
            </div>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                expandedMenu === 'brand'
                  ? 'grid-rows-[1fr]'
                  : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden pl-4">
                {allColumns
                  .filter((c) => c.group === 'brand')
                  .flatMap((c) => c.items)
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={`/${currentLocale}${item.href}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-[13px] text-[#706263]"
                    >
                      {item.label}
                    </Link>
                  ))}
              </div>
            </div>

            {/* 미디어 */}
            <div className="flex items-center">
              <Link
                href={`/${currentLocale}/media/press`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex-1 py-3.5 text-[16px] font-medium',
                  expandedMenu === 'media'
                    ? 'text-[#a83c44]'
                    : 'text-[#2b2b2b]',
                )}
              >
                {tNav('media')}
              </Link>
              <button
                onClick={() => {
                  setExpandedMenu(expandedMenu === 'media' ? null : 'media');
                  setExpandedCategory(null);
                }}
                className="flex h-12 w-12 items-center justify-center text-[14px] text-[#706263]"
              >
                {expandedMenu === 'media' ? '▾' : '▸'}
              </button>
            </div>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                expandedMenu === 'media'
                  ? 'grid-rows-[1fr]'
                  : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden pl-4">
                {allColumns
                  .filter((c) => c.group === 'media')
                  .flatMap((c) => c.items)
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={`/${currentLocale}${item.href}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-[13px] text-[#706263]"
                    >
                      {item.label}
                    </Link>
                  ))}
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-[#efe5d9]" />

            {/* Cart */}
            <Link
              href={`/${currentLocale}/estimate`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative inline-flex items-center gap-1 py-2 text-[14px] font-medium text-[#2b2b2b]"
            >
              <span className="relative">
                🛒
                <CartBadge />
              </span>
              {tCommon('estimate')}
            </Link>

            {/* CTA */}
            <Link
              href={`/${currentLocale}/contact`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 flex items-center justify-center rounded-[4px] bg-[#a83c44] py-3.5 text-[14px] font-medium text-white"
            >
              {tCommon('reservation')}
            </Link>
          </nav>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
