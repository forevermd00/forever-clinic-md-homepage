'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

const allChannels = [
  {
    id: 'wechat',
    label: 'WeChat',
    href: '#wechat',
    bg: 'bg-[#07C160]',
    icon: '/images/icons/wechat.svg',
  },
  {
    id: 'line',
    label: 'LINE',
    href: '#line',
    bg: 'bg-[#06C755]',
    icon: '/images/icons/line.svg',
  },
  {
    id: 'kakao',
    label: 'KakaoTalk',
    href: '#kakao',
    bg: 'bg-[#FEE500]',
    icon: '/images/icons/kakaotalk.svg',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: '#whatsapp',
    bg: 'bg-[#25D366]',
    icon: '/images/icons/whatsapp.svg',
  },
];

// 언어별 우선 채널 (기획서 기준: ko→카카오, zh→WeChat, ja→LINE, en→WhatsApp)
const localePriority: Record<string, string> = {
  ko: 'kakao',
  zh: 'wechat',
  ja: 'line',
  en: 'whatsapp',
};

export function FloatingCTA() {
  const t = useTranslations('floatingCta');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ko';
  const [isOpen, setIsOpen] = useState(true);

  const channels = useMemo(() => {
    const priorityId = localePriority[locale] || 'kakao';
    const priority = allChannels.find((c) => c.id === priorityId)!;
    const rest = allChannels.filter((c) => c.id !== priorityId);
    return [...rest.reverse(), priority];
  }, [locale]);

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
        {channels.map(({ id, label, href, bg, icon }, i) => (
          <a
            key={id}
            href={href}
            title={label}
            className="flex items-center gap-3 rounded-[8px] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
            style={{ transitionDelay: isOpen ? `${i * 30}ms` : '0ms' }}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                bg,
              )}
            >
              <Image
                src={icon}
                alt={label}
                width={20}
                height={20}
                className="size-5"
              />
            </span>
            <span className="text-[14px] font-medium whitespace-nowrap text-[#353535]">
              {label}
            </span>
          </a>
        ))}
      </div>

      {/* Main FAB button - click to toggle */}
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
