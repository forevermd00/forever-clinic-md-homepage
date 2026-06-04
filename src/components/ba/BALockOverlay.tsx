'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface BALockOverlayProps {
  locale: string;
  className?: string;
  children: React.ReactNode;
}

export function BALockOverlay({
  locale,
  className,
  children,
}: BALockOverlayProps) {
  const t = useTranslations('ba');
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const locked = !isLoggedIn;

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 bg-[#efe5d9]',
        className,
      )}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#706263"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <button
        type="button"
        data-ga-id="ba-lock-login"
        className="rounded-[4px] bg-[#a83c44] px-3 py-1.5 text-[11px] font-medium text-white"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(
            `/${locale}/auth/login?callbackUrl=${encodeURIComponent(pathname)}`,
          );
        }}
      >
        {t('loginToView')}
      </button>
    </div>
  );
}
