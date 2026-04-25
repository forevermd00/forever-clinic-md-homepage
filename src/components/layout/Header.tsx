'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';

const navItems = [
  { key: 'treatments', href: '/treatments' },
  { key: 'brand', href: '/brand' },
  { key: 'beforeAfter', href: '/before-after' },
  { key: 'media', href: '/media' },
  { key: 'estimate', href: '/estimate' },
] as const;

export function Header() {
  const t = useTranslations('header');
  const tCommon = useTranslations('common');
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

  // Close mobile menu on route change
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
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 transition-[background-color,box-shadow] duration-200',
          isScrolled ? 'bg-white shadow-[var(--shadow-2)]' : 'bg-white',
        )}
      >
        <div className="mx-auto flex h-14 max-w-[var(--container-max)] items-center justify-between px-4 md:h-[60px] md:px-6 lg:h-16 lg:px-12">
          {/* Logo */}
          <a
            href={`/${currentLocale}`}
            className="text-forever-charcoal text-[18px] font-bold"
          >
            Forever Clinic
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="main">
            {navItems.map(({ key, href }) => (
              <a
                key={key}
                href={`/${currentLocale}${href}`}
                className="hover:text-forever-charcoal text-[14px] font-medium text-neutral-600 transition-colors"
              >
                {t(key)}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="border-forever-taupe text-forever-charcoal flex items-center gap-2 rounded-[var(--radius-button)] border px-3 py-2 text-[13px] font-medium"
                aria-label="Change language"
              >
                <span>🌐</span>
                <span>{localeNames[currentLocale]}</span>
                <span className="text-[10px] text-neutral-500">▾</span>
              </button>
              {isLangOpen && (
                <div className="absolute top-full right-0 mt-1 overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-2)]">
                  {locales.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => {
                        switchLocale(locale);
                        setIsLangOpen(false);
                      }}
                      className={cn(
                        'block w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-neutral-100',
                        locale === currentLocale
                          ? 'text-forever-red font-semibold'
                          : 'text-forever-charcoal',
                      )}
                    >
                      {localeNames[locale]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Button — desktop only */}
            <a
              href={`/${currentLocale}/contact`}
              className="bg-forever-red hover:bg-forever-red-hover hidden rounded-[var(--radius-button)] px-5 py-2.5 text-[14px] font-medium text-white transition-colors md:inline-flex"
            >
              {tCommon('reservation')}
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
                    'bg-forever-charcoal block h-0.5 w-5 transition-transform',
                    isMobileMenuOpen && 'translate-y-2 rotate-45',
                  )}
                />
                <span
                  className={cn(
                    'bg-forever-charcoal block h-0.5 w-5 transition-opacity',
                    isMobileMenuOpen && 'opacity-0',
                  )}
                />
                <span
                  className={cn(
                    'bg-forever-charcoal block h-0.5 w-5 transition-transform',
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
        <div className="fixed inset-0 z-40 bg-white pt-14 md:hidden">
          <nav className="flex flex-col px-6 py-8">
            {navItems.map(({ key, href }) => (
              <a
                key={key}
                href={`/${currentLocale}${href}`}
                className="text-forever-charcoal border-b border-neutral-200 py-4 text-[16px] font-medium"
              >
                {t(key)}
              </a>
            ))}
            <a
              href={`/${currentLocale}/contact`}
              className="bg-forever-red mt-6 flex items-center justify-center rounded-[var(--radius-button)] py-3 text-[16px] font-medium text-white"
            >
              {tCommon('reservation')}
            </a>
          </nav>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-14 md:h-[60px] lg:h-16" />
    </>
  );
}
