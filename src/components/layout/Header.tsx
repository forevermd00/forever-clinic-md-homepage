'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';

const navItems = [
  { label: 'Before & After', href: '/before-after' },
  { label: '시술', href: '/treatments' },
  { label: '브랜드', href: '/brand' },
  { label: '미디어', href: '/media' },
] as const;

export function Header() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] as Locale;
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
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
    }
  });

  const switchLocale = (locale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
    setIsLangOpen(false);
  };

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
          <a
            href={`/${currentLocale}`}
            className="text-[18px] font-bold tracking-[2px] text-[#2b2b2b]"
          >
            FOREVER CLINIC
          </a>

          {/* Desktop Nav — center */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="main">
            {navItems.map(({ label, href }) => (
              <a
                key={href}
                href={`/${currentLocale}${href}`}
                className="text-[14px] font-medium text-[#2b2b2b] transition-colors hover:opacity-70"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
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

            {/* Cart icon — desktop */}
            <button
              className="hidden text-[18px] text-[#2b2b2b] md:inline-flex"
              aria-label="Cart"
            >
              🛒
            </button>

            {/* CTA Button — desktop */}
            <a
              href={`/${currentLocale}/contact`}
              className="hidden rounded-[4px] bg-[#a83c44] px-4 py-2 text-[13px] text-white transition-colors hover:bg-[#8c2e38] md:inline-flex"
            >
              예약하기
            </a>

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
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 md:hidden">
          <nav className="flex flex-col px-6 py-8">
            {navItems.map(({ label, href }) => (
              <a
                key={href}
                href={`/${currentLocale}${href}`}
                className="border-b border-neutral-200 py-4 text-[16px] font-medium text-[#2b2b2b]"
              >
                {label}
              </a>
            ))}
            <a
              href={`/${currentLocale}/contact`}
              className="mt-6 flex items-center justify-center rounded-[4px] bg-[#a83c44] py-3 text-[16px] font-medium text-white"
            >
              예약하기
            </a>
          </nav>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
