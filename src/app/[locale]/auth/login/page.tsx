'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const inputClass =
  'h-[48px] w-full rounded-[6px] border border-[#efe5d9] bg-white pl-4 pr-4 text-[15px] text-[#2b2b2b] placeholder:text-[#bbb] focus:border-[#a83c44] focus:outline-none transition-colors';

function LoginForm() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('errorLoginFailed'));
      } else {
        router.push(callbackUrl || `/${locale}`);
        router.refresh();
      }
    } catch {
      setError(t('errorLoginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#faf8f5] px-5">
      <form
        onSubmit={handleLogin}
        className="flex w-full max-w-[640px] flex-col"
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

        {/* Error */}
        {error && (
          <p className="mt-4 text-center text-[13px] text-[#a83c44]">{error}</p>
        )}

        {/* Login button */}
        <button
          type="submit"
          disabled={loading}
          data-ga-id="auth-login-submit"
          className="mt-8 h-[52px] w-full cursor-pointer rounded-[6px] bg-[#a83c44] text-[16px] font-bold text-white transition-colors hover:bg-[#8c2e38] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '...' : t('loginButton')}
        </button>

        {/* Footer links */}
        <div className="mt-8 flex items-center justify-center gap-3 text-[13px]">
          <Link
            href={`/${locale}/auth/reset-password`}
            data-ga-id="auth-login-to-reset"
            className="text-[#999] transition-colors hover:text-[#706263]"
          >
            {t('forgotPassword')}
          </Link>
          <span className="text-[#d9cfc5]">|</span>
          <Link
            href={`/${locale}/auth/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            data-ga-id="auth-login-to-signup"
            className="font-medium text-[#a83c44] transition-colors hover:text-[#8c2e38]"
          >
            {tCommon('signup')}
          </Link>
        </div>
      </form>
    </div>
  );
}

// useSearchParams는 Suspense 경계가 필요 (Next.js 정적 렌더링)
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
