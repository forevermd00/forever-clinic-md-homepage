'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

interface MessengerLink {
  _key: string;
  platform: string;
  url?: string;
  label?: string;
  isVisible?: boolean;
  sortKo?: number;
  sortEn?: number;
  sortZh?: number;
  sortJa?: number;
}

const PLATFORM_CONFIG: Record<
  string,
  { bg: string; icon: string; fallbackLabel: string }
> = {
  wechat: {
    bg: 'bg-[#07C160]',
    icon: '/images/icons/wechat.svg',
    fallbackLabel: 'WeChat',
  },
  line: {
    bg: 'bg-[#06C755]',
    icon: '/images/icons/line.svg',
    fallbackLabel: 'LINE',
  },
  kakaotalk: {
    bg: 'bg-[#FEE500]',
    icon: '/images/icons/kakaotalk.svg',
    fallbackLabel: 'KakaoTalk',
  },
  whatsapp: {
    bg: 'bg-[#25D366]',
    icon: '/images/icons/whatsapp.svg',
    fallbackLabel: 'WhatsApp',
  },
};

// 언어별 우선 채널 (맨 아래 = 메인 버튼)
const LOCALE_PRIORITY: Record<string, string> = {
  ko: 'kakaotalk',
  zh: 'wechat',
  ja: 'line',
  en: 'whatsapp',
};

const SORT_KEY: Record<string, keyof MessengerLink> = {
  ko: 'sortKo',
  en: 'sortEn',
  zh: 'sortZh',
  ja: 'sortJa',
};

interface FloatingCTAProps {
  messengerLinks?: MessengerLink[];
}

export function FloatingCTA({ messengerLinks = [] }: FloatingCTAProps) {
  const t = useTranslations('floatingCta');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ko';
  const [isOpen, setIsOpen] = useState(true);

  const channels = useMemo(() => {
    const sortKey = SORT_KEY[locale] ?? 'sortKo';
    const priorityPlatform = LOCALE_PRIORITY[locale] ?? 'kakaotalk';

    const visible = messengerLinks
      .filter(
        (l) => l.isVisible !== false && l.url && PLATFORM_CONFIG[l.platform],
      )
      .sort((a, b) => {
        const av = (a[sortKey] as number | undefined) ?? 999;
        const bv = (b[sortKey] as number | undefined) ?? 999;
        return av - bv;
      });

    // 우선 채널을 맨 아래(마지막)에 배치
    const priority = visible.find((l) => l.platform === priorityPlatform);
    const rest = visible.filter((l) => l.platform !== priorityPlatform);
    return priority ? [...rest, priority] : visible;
  }, [messengerLinks, locale]);

  if (channels.length === 0) return null;

  return (
    <div
      className="fixed right-6 bottom-6 z-[900] md:right-8 md:bottom-8"
      role="region"
      aria-label={t('contactOptions')}
    >
      {/* Expanded menu */}
      <div
        className={cn(
          'absolute right-0 bottom-[70px] flex flex-col gap-2 transition-all duration-200',
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-2.5 opacity-0',
        )}
      >
        {channels.map(({ _key, platform, url, label }, i) => {
          const config = PLATFORM_CONFIG[platform];
          if (!config) return null;
          const displayLabel = label || config.fallbackLabel;
          return (
            <a
              key={_key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={displayLabel}
              className="flex items-center gap-3 rounded-[8px] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
              style={{ transitionDelay: isOpen ? `${i * 30}ms` : '0ms' }}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full',
                  config.bg,
                )}
              >
                <Image
                  src={config.icon}
                  alt={displayLabel}
                  width={20}
                  height={20}
                  className="size-5"
                />
              </span>
              <span className="text-[14px] font-medium whitespace-nowrap text-[#353535]">
                {displayLabel}
              </span>
            </a>
          );
        })}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-14 items-center justify-center rounded-full bg-[#840202] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:scale-110"
        aria-label={isOpen ? t('closeChat') : t('openChat')}
      >
        {isOpen ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M15 5L5 15" />
            <path d="M5 5L15 15" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
