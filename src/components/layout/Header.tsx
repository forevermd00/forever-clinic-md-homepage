'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';
import { CartBadge } from '@/components/layout/CartBadge';
import { UserMenu } from '@/components/layout/UserMenu';
import type { SectionVisibility } from '@/lib/data/visibility';
import type { NavTreatment } from '@/lib/sanity/queries';

/* ----------------------------------------------------------------
   Megamenu types & static columns (BA / Brand / Media)
   Treatment columns are built dynamically from Sanity navTreatments.
   ---------------------------------------------------------------- */
type MegaItem = { tKey?: string; directName?: string; href: string };
type MegaColumn = {
  group: string;
  titleKey: string;
  titleNs: 'megamenu' | 'nav' | 'footer';
  href: string;
  items: MegaItem[];
  dividerAfter?: boolean;
};

const STATIC_BA_COLUMN: MegaColumn = {
  group: 'ba',
  titleKey: 'beforeAfter',
  titleNs: 'nav',
  href: '/before-after',
  items: [
    { tKey: 'baAll', href: '/before-after' },
    { tKey: 'baLifting', href: '/before-after?cat=lifting' },
    { tKey: 'baSkincare', href: '/before-after?cat=skincare' },
    { tKey: 'baToning', href: '/before-after?cat=toning' },
    { tKey: 'baBotox', href: '/before-after?cat=botox' },
  ],
  dividerAfter: true,
};

const STATIC_BRAND_COLUMN: MegaColumn = {
  group: 'brand',
  titleKey: 'brand',
  titleNs: 'footer',
  href: '/brand',
  items: [
    { tKey: 'brandPhilosophy', href: '/brand#philosophy' },
    { tKey: 'doctors', href: '/brand#doctors' },
    { tKey: 'facilities', href: '/brand#facilities' },
    { tKey: 'equipment', href: '/brand#equipment' },
    { tKey: 'location', href: '/brand#location' },
  ],
  dividerAfter: true,
};

const STATIC_MEDIA_COLUMN: MegaColumn = {
  group: 'media',
  titleKey: 'media',
  titleNs: 'footer',
  href: '/media',
  items: [
    { tKey: 'press', href: '/media/press' },
    { tKey: 'video', href: '/media/video' },
    { tKey: 'blog', href: '/media/blog' },
    { tKey: 'notice', href: '/media/notice' },
  ],
};

const CATEGORY_ORDER = [
  'lifting-laser',
  'petit-lifting',
  'skincare',
  'skin-booster',
  'hair-removal',
  'anesthesia',
];

const CATEGORY_TITLE_KEYS: Record<string, string> = {
  'lifting-laser': 'liftingLaser',
  'petit-lifting': 'petitLifting',
  skincare: 'skincareCat',
  'skin-booster': 'skinBooster',
  'hair-removal': 'hairRemoval',
  anesthesia: 'anesthesia',
};

const CATEGORY_VIS_KEYS: Record<string, keyof SectionVisibility['nav']> = {
  'lifting-laser': 'catLiftingLaser',
  'petit-lifting': 'catPetitLifting',
  skincare: 'catSkincare',
  'skin-booster': 'catSkinBooster',
  'hair-removal': 'catHairRemoval',
  anesthesia: 'catAnesthesia',
};

/* Nav items with group mapping - label is a translation key under "nav" namespace */
const ALL_NAV_ITEMS = [
  {
    labelKey: 'beforeAfter',
    href: '/before-after',
    group: 'ba',
    visKey: 'bnA' as const,
  },
  {
    labelKey: 'treatments',
    href: '/treatments',
    group: 'treatments',
    visKey: 'treatments' as const,
  },
  {
    labelKey: 'brand',
    href: '/brand',
    group: 'brand',
    visKey: 'brand' as const,
  },
  {
    labelKey: 'media',
    href: '/media',
    group: 'media',
    visKey: 'media' as const,
  },
];

/* Shared column renderer */
function MegaColumn({
  col,
  locale,
  tMega,
  tFooter,
  tNav,
}: {
  col: MegaColumn;
  locale: string;
  tMega: (key: string) => string;
  tFooter: (key: string) => string;
  tNav: (key: string) => string;
}) {
  const titleTranslate =
    col.titleNs === 'nav' ? tNav : col.titleNs === 'footer' ? tFooter : tMega;

  return (
    <div className="flex flex-col pr-4 lg:pr-6">
      <Link
        href={`/${locale}${col.href}`}
        className="pb-3 text-[13px] font-bold text-[#a83c44]"
      >
        {titleTranslate(col.titleKey)}
      </Link>
      <div className="mb-2 h-px w-[120px] bg-[#d9cfc5]" />
      {col.items.map((item) => (
        <Link
          key={item.href}
          href={`/${locale}${item.href}`}
          scroll={true}
          className="py-[5px] text-[13px] text-[#555] transition-colors hover:text-[#a83c44]"
        >
          {item.directName ?? (item.tKey ? tMega(item.tKey) : '')}
        </Link>
      ))}
    </div>
  );
}

interface HeaderProps {
  navVisibility?: SectionVisibility['nav'];
  navTreatments?: NavTreatment[];
}

export function Header({
  navVisibility,
  navTreatments = [],
}: HeaderProps = {}) {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] as Locale;
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tFooter = useTranslations('footer');
  const tMega = useTranslations('megamenu');

  const treatmentColumns = useMemo<MegaColumn[]>(() => {
    if (!navTreatments.length) return [];
    const grouped = new Map<string, NavTreatment[]>();
    for (const t of navTreatments) {
      if (!grouped.has(t.category)) grouped.set(t.category, []);
      grouped.get(t.category)!.push(t);
    }
    const cats = CATEGORY_ORDER.filter((cat) => {
      if (!grouped.has(cat)) return false;
      const visKey = CATEGORY_VIS_KEYS[cat];
      if (visKey && navVisibility && navVisibility[visKey] === false)
        return false;
      return true;
    });
    return cats.map((cat, idx) => ({
      group: 'treatments',
      titleKey: CATEGORY_TITLE_KEYS[cat] || cat,
      titleNs: 'footer' as const,
      href: `/treatments?cat=${cat}`,
      items: (grouped.get(cat) ?? []).map((t) => ({
        directName:
          t.name[currentLocale as keyof typeof t.name] ?? t.name.ko ?? '',
        href: `/treatments/${t.category}/${t.slug}`,
      })),
      dividerAfter: idx === cats.length - 1,
    }));
  }, [navTreatments, currentLocale, navVisibility]);

  const allColumns = useMemo<MegaColumn[]>(
    () => [
      ...(!navVisibility || navVisibility.bnA !== false
        ? [STATIC_BA_COLUMN]
        : []),
      ...(!navVisibility || navVisibility.treatments !== false
        ? treatmentColumns
        : []),
      ...(!navVisibility || navVisibility.brand !== false
        ? [STATIC_BRAND_COLUMN]
        : []),
      ...(!navVisibility || navVisibility.media !== false
        ? [STATIC_MEDIA_COLUMN]
        : []),
    ],
    [treatmentColumns, navVisibility],
  );

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [isLg, setIsLg] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const prevPathname = useRef(pathname);
  const langRef = useRef<HTMLDivElement>(null);

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

  // 언어 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!isLangOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangOpen]);

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

  const localeFonts: Record<string, string> = {
    ko: 'sandoll-myeongjoneo1, serif',
    en: 'minion-3, serif',
    zh: 'tt-songti-chs-variable, serif',
    ja: 'kozuka-mincho-pro-b, serif',
  };

  const switchLocale = (locale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    window.location.assign(segments.join('/'));
  };

  const navItems = ALL_NAV_ITEMS.filter(
    (item) => !navVisibility || navVisibility[item.visKey] !== false,
  );

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
              className="flex items-center"
              aria-label="Forever Clinic Myeongdong"
            >
              <Image
                src="/images/logo-horizontal.svg"
                alt="Forever Clinic Myeongdong"
                width={160}
                height={75}
                priority
                className="h-6 w-auto"
              />
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
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  style={{ fontFamily: localeFonts[currentLocale] }}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-[#2b2b2b]"
                  aria-label="Change language"
                >
                  {localeNames[currentLocale]}{' '}
                  <span
                    className="text-[10px]"
                    style={{ fontFamily: 'inherit' }}
                  >
                    ▾
                  </span>
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-1 min-w-[100px] overflow-hidden rounded-[4px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                    {locales.map((locale) => (
                      <button
                        key={locale}
                        onClick={() => switchLocale(locale)}
                        style={{ fontFamily: localeFonts[locale] }}
                        className={cn(
                          'block w-full px-4 py-2 text-center text-[13px] transition-colors hover:bg-neutral-100',
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

              <UserMenu locale={currentLocale} />

              <Link
                href={`/${currentLocale}/estimate`}
                className="relative hidden text-[#2b2b2b] md:inline-flex"
                aria-label="Cart"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
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
            className="hidden border-b border-[#d9cfc5] bg-[#faf8f5] md:block"
            onMouseEnter={() => {
              if (megaTimeout.current) clearTimeout(megaTimeout.current);
            }}
            onMouseLeave={closeMega}
          >
            <div className="flex justify-center px-8 py-9 lg:px-16">
              {(isLg ? allColumns : filteredColumns).map((col, i, arr) => (
                <div
                  key={col.titleKey + col.group}
                  className="flex shrink-0 items-start"
                >
                  <MegaColumn
                    col={col}
                    locale={currentLocale}
                    tMega={tMega}
                    tFooter={tFooter}
                    tNav={tNav}
                  />
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
            {(!navVisibility || navVisibility.bnA !== false) && (
              <>
                <div className="flex items-center">
                  <Link
                    href={`/${currentLocale}/before-after`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex-1 py-3.5 text-[16px] font-medium',
                      expandedMenu === 'ba'
                        ? 'text-[#a83c44]'
                        : 'text-[#2b2b2b]',
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
                    expandedMenu === 'ba'
                      ? 'grid-rows-[1fr]'
                      : 'grid-rows-[0fr]',
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
                          {item.directName ??
                            (item.tKey ? tMega(item.tKey) : '')}
                        </Link>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* 시술 */}
            {(!navVisibility || navVisibility.treatments !== false) && (
              <>
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
                      .map((cat) => {
                        const catLabel =
                          cat.titleNs === 'footer'
                            ? tFooter(cat.titleKey)
                            : tMega(cat.titleKey);
                        return (
                          <div key={cat.titleKey}>
                            <div className="flex items-center">
                              <Link
                                href={`/${currentLocale}${cat.href}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                  'flex-1 py-2.5 text-[14px] font-bold',
                                  expandedCategory === cat.titleKey
                                    ? 'text-[#a83c44]'
                                    : 'text-[#2b2b2b]',
                                )}
                              >
                                {catLabel}
                              </Link>
                              <button
                                onClick={() =>
                                  setExpandedCategory(
                                    expandedCategory === cat.titleKey
                                      ? null
                                      : cat.titleKey,
                                  )
                                }
                                className="flex h-10 w-12 items-center justify-center text-[12px] text-[#706263]"
                              >
                                {expandedCategory === cat.titleKey ? '▾' : '▸'}
                              </button>
                            </div>
                            <div
                              className={cn(
                                'grid transition-[grid-template-rows] duration-300 ease-out',
                                expandedCategory === cat.titleKey
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
                                    {item.directName ??
                                      (item.tKey ? tMega(item.tKey) : '')}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}

            {/* 브랜드 */}
            {(!navVisibility || navVisibility.brand !== false) && (
              <>
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
                      setExpandedMenu(
                        expandedMenu === 'brand' ? null : 'brand',
                      );
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
                          {item.directName ??
                            (item.tKey ? tMega(item.tKey) : '')}
                        </Link>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* 미디어 */}
            {(!navVisibility || navVisibility.media !== false) && (
              <>
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
                      setExpandedMenu(
                        expandedMenu === 'media' ? null : 'media',
                      );
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
                          {item.directName ??
                            (item.tKey ? tMega(item.tKey) : '')}
                        </Link>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="my-4 h-px bg-[#efe5d9]" />

            {/* Language Selector */}
            <div className="mb-4 flex justify-center gap-3">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => {
                    switchLocale(locale);
                  }}
                  style={{ fontFamily: localeFonts[locale] }}
                  className={cn(
                    'px-3 py-1.5 text-[14px] transition-colors',
                    locale === currentLocale
                      ? 'font-semibold text-[#a83c44]'
                      : 'text-[#2b2b2b]',
                  )}
                >
                  {localeNames[locale]}
                </button>
              ))}
            </div>

            {/* User */}
            <UserMenu locale={currentLocale} mobile />

            {/* Cart */}
            <Link
              href={`/${currentLocale}/estimate`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative inline-flex items-center gap-2 py-2 text-[14px] font-medium text-[#2b2b2b]"
            >
              <span className="relative">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
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
