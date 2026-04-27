'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

interface UserMenuProps {
  locale: string;
  mobile?: boolean;
}

export function UserMenu({ locale, mobile }: UserMenuProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { data: session } = useSession();
  const t = useTranslations('common');
  const tAuth = useTranslations('auth');
  const [isOpen, setIsOpen] = useState(false);

  if (!mounted) return null;

  const isLoggedIn = !!session?.user;

  // Mobile layout
  if (mobile) {
    if (isLoggedIn) {
      return (
        <div className="flex items-center justify-between py-2">
          <span className="text-[14px] font-medium text-[#2b2b2b]">
            {session.user.name || session.user.email}
          </span>
          <button
            onClick={() => signOut()}
            className="text-[13px] text-[#706263]"
          >
            {tAuth('logout')}
          </button>
        </div>
      );
    }
    return (
      <Link
        href={`/${locale}/auth/login`}
        className="py-2 text-[14px] font-medium text-[#2b2b2b]"
      >
        {t('login')}
      </Link>
    );
  }

  // Desktop layout
  if (isLoggedIn) {
    return (
      <div className="relative hidden md:block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center text-[13px] font-medium text-[#2b2b2b]"
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute top-full right-0 mt-1 w-[160px] overflow-hidden rounded-[4px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
            <div className="border-b border-[#efe5d9] px-4 py-2.5">
              <p className="truncate text-[13px] font-medium text-[#2b2b2b]">
                {session.user.name || session.user.email}
              </p>
            </div>
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-[13px] text-[#706263] transition-colors hover:bg-neutral-50"
            >
              {tAuth('logout')}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/${locale}/auth/login`}
      className="hidden text-[#2b2b2b] md:inline-flex"
      aria-label={t('login')}
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
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </Link>
  );
}
