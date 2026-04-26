'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const inputClass =
  'h-[48px] w-full rounded-[6px] border border-[#efe5d9] bg-white pl-4 pr-4 text-[15px] text-[#2b2b2b] placeholder:text-[#bbb] focus:border-[#a83c44] focus:outline-none transition-colors';

export default function LoginPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo — no actual auth
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5] px-5">
      <form
        onSubmit={handleLogin}
        className="mx-auto flex max-w-[640px] flex-col py-16 md:py-20"
      >
        {/* Header */}
        <h1 className="text-center text-[32px] font-bold text-[#2b2b2b]">
          {t('loginTitle')}
        </h1>
        <p className="mt-2 text-center text-[14px] text-[#999]">
          {t('loginSubtitle')}
        </p>

        {/* Fields */}
        <div className="mt-10 flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-[13px] font-medium text-[#2b2b2b]"
            >
              {t('email')}
            </label>
            <input
              id="login-email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-[13px] font-medium text-[#2b2b2b]"
            >
              {t('password')}
            </label>
            <input
              id="login-password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Login button */}
        <button
          type="submit"
          className="mt-8 h-[52px] w-full cursor-pointer rounded-[6px] bg-[#a83c44] text-[16px] font-bold text-white transition-colors hover:bg-[#8c2e38]"
        >
          {t('loginButton')}
        </button>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#efe5d9]" />
          <span className="text-[12px] text-[#999]">{tCommon('or')}</span>
          <div className="h-px flex-1 bg-[#efe5d9]" />
        </div>

        {/* Google button */}
        <button
          type="button"
          className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[6px] border border-[#efe5d9] bg-white text-[14px] text-[#2b2b2b] transition-colors hover:bg-[#faf8f5]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
              fill="#EA4335"
            />
          </svg>
          {t('googleLogin')}
        </button>

        {/* Footer links */}
        <div className="mt-8 flex items-center justify-center gap-3 text-[13px]">
          <Link
            href={`/${locale}/auth/reset-password`}
            className="text-[#999] transition-colors hover:text-[#706263]"
          >
            {t('forgotPassword')}
          </Link>
          <span className="text-[#d9cfc5]">|</span>
          <Link
            href={`/${locale}/auth/signup`}
            className="font-medium text-[#a83c44] transition-colors hover:text-[#8c2e38]"
          >
            {tCommon('signup')}
          </Link>
        </div>
      </form>
    </div>
  );
}
