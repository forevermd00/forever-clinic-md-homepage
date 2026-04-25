'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';

const megamenuData = [
  {
    label: 'Before & After',
    href: '/before-after',
    children: [
      { label: '전체', href: '/before-after' },
      { label: '리프팅', href: '/before-after?category=lifting' },
      { label: '피부케어', href: '/before-after?category=skincare' },
      { label: '토닝·색소', href: '/before-after?category=toning' },
      { label: '보톡스·필러', href: '/before-after?category=botox' },
    ],
  },
  {
    label: '시술',
    href: '/treatments',
    children: [
      { label: '리프팅', href: '/treatments/lifting' },
      { label: '피부케어', href: '/treatments/skincare' },
      { label: '토닝·색소', href: '/treatments/toning' },
      { label: '보톡스·필러', href: '/treatments/botox-filler' },
    ],
  },
  {
    label: '브랜드',
    href: '/brand',
    children: [
      { label: '브랜드 스토리', href: '/brand' },
      { label: '의료진 소개', href: '/brand#doctors' },
      { label: '시설 안내', href: '/brand#facilities' },
      { label: '오시는 길', href: '/brand#location' },
    ],
  },
  {
    label: '미디어',
    href: '/media',
    children: [
      { label: '공지사항', href: '/media/notice' },
      { label: '이벤트', href: '/promotions' },
      { label: '블로그', href: '/media/blog' },
      { label: '영상', href: '/media/video' },
    ],
  },
] as const;

export function Header() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] as Locale;
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const megamenuTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setIsMobileMenuOpen(false);
      setHoveredNav(null);
    }
  });

  const handleNavEnter = (label: string) => {
    if (megamenuTimeout.current) clearTimeout(megamenuTimeout.current);
    setHoveredNav(label);
  };

  const handleNavLeave = () => {
    megamenuTimeout.current = setTimeout(() => setHoveredNav(null), 150);
  };

  const switchLocale = (locale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
    setIsLangOpen(false);
  };

  const activeMenu = megamenuData.find((m) => m.label === hoveredNav);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 border-b border-[#e8dfd7] bg-white transition-shadow duration-200',
          isScrolled && 'shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
        )}
      >
        <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-12">
          {/* Logo */}
          <Link
            href={`/${currentLocale}`}
            className="text-[18px] font-bold tracking-[2px] text-[#2b2b2b]"
          >
            FOREVER CLINIC
          </Link>

          {/* Desktop Nav — center */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="main">
            {megamenuData.map((item) => (
              <div
                key={item.label}
                onMouseEnter={() => handleNavEnter(item.label)}
                onMouseLeave={handleNavLeave}
              >
                <Link
                  href={`/${currentLocale}${item.href}`}
                  className={cn(
                    'relative py-5 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:text-[#a83c44]',
                    hoveredNav === item.label && 'text-[#a83c44]',
                  )}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#2b2b2b]"
                aria-label="Change language"
              >
                <span>🇰🇷</span>
                <span>
                  {localeNames[currentLocale] === '한국어'
                    ? 'KO'
                    : currentLocale.toUpperCase()}
                </span>
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
              className="hidden text-[18px] text-[#2b2b2b] md:inline-flex"
              aria-label="Cart"
            >
              🛒
            </Link>

            <Link
              href={`/${currentLocale}/contact`}
              className="hidden rounded-[4px] bg-[#a83c44] px-4 py-2 text-[13px] text-white transition-colors hover:bg-[#8c2e38] md:inline-flex"
            >
              예약하기
            </Link>

            {/* Mobile hamburger */}
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

        {/* Megamenu dropdown */}
        {activeMenu && (
          <div
            className="hidden border-t border-[#e8dfd7] bg-white md:block"
            onMouseEnter={() => handleNavEnter(activeMenu.label)}
            onMouseLeave={handleNavLeave}
          >
            <div className="mx-auto flex max-w-[1280px] gap-8 px-12 py-6">
              <div className="flex flex-col gap-3">
                <span className="text-[13px] font-bold text-[#2b2b2b]">
                  {activeMenu.label}
                </span>
                {activeMenu.children.map((child) => (
                  <Link
                    key={child.href}
                    href={`/${currentLocale}${child.href}`}
                    className="text-[13px] text-[#706263] transition-colors hover:text-[#a83c44]"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-white pt-16 md:hidden">
          <nav className="flex flex-col px-6 py-8">
            {megamenuData.map((item) => (
              <div key={item.label} className="border-b border-neutral-200">
                <Link
                  href={`/${currentLocale}${item.href}`}
                  className="block py-4 text-[16px] font-medium text-[#2b2b2b]"
                >
                  {item.label}
                </Link>
                <div className="flex flex-col gap-2 pb-4 pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={`/${currentLocale}${child.href}`}
                      className="text-[14px] text-[#706263]"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link
              href={`/${currentLocale}/contact`}
              className="mt-6 flex items-center justify-center rounded-[4px] bg-[#a83c44] py-3 text-[16px] font-medium text-white"
            >
              예약하기
            </Link>
          </nav>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
