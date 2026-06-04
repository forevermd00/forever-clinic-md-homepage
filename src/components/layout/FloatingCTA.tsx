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
  logo?: { asset?: { url?: string } };
  qr?: { asset?: { url?: string } };
  isVisible?: boolean;
  sortKo?: number;
  sortEn?: number;
  sortZh?: number;
  sortJa?: number;
}

const PLATFORM_CONFIG: Record<string, { bg: string; fallbackLabel: string }> = {
  wechat: { bg: 'bg-[#07C160]', fallbackLabel: 'WeChat' },
  line: { bg: 'bg-[#06C755]', fallbackLabel: 'LINE' },
  kakaotalk: { bg: 'bg-[#FEE500]', fallbackLabel: 'KakaoTalk' },
  whatsapp: { bg: 'bg-[#25D366]', fallbackLabel: 'WhatsApp' },
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
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const channels = useMemo(() => {
    const sortKey = SORT_KEY[locale] ?? 'sortKo';
    const priorityPlatform = LOCALE_PRIORITY[locale] ?? 'kakaotalk';

    const visible = messengerLinks
      .filter((l) => l.isVisible !== false && l.url)
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

  // 시술 상세에서는 하단 선택기 바 위로 올려 접힘 상태에서 가리지 않게 한다.
  // (펼친 패널은 z-index가 더 높아 자연히 덮음 — 위치 토글이 아닌 z-index 처리)
  const segs = pathname.split('/').filter(Boolean);
  const isTreatmentDetail = segs[1] === 'treatments' && segs.length >= 4;

  return (
    <div
      className={cn(
        'fixed right-6 z-[900] md:right-8',
        isTreatmentDetail ? 'bottom-24' : 'bottom-6 md:bottom-8',
      )}
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
        {channels.map(({ _key, platform, url, label, logo, qr }, i) => {
          const config = PLATFORM_CONFIG[platform];
          const displayLabel = label || config?.fallbackLabel || platform;
          const iconUrl = logo?.asset?.url;
          const qrUrl = qr?.asset?.url;
          return (
            <a
              key={_key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={displayLabel}
              data-ga-id={`floating-cta.messenger-${platform}`}
              data-ga-event="messenger_click"
              data-ga-platform={platform}
              onMouseEnter={() => setHoveredKey(_key)}
              onMouseLeave={() => setHoveredKey((k) => (k === _key ? null : k))}
              className="relative flex items-center gap-3 rounded-[8px] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
              style={{ transitionDelay: isOpen ? `${i * 30}ms` : '0ms' }}
            >
              {qrUrl && hoveredKey === _key && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: 'calc(100% + 12px)',
                    transform: 'translateY(-50%)',
                    width: 170,
                    background: '#fff',
                    padding: 10,
                    borderRadius: 16,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    zIndex: 1000,
                    lineHeight: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt={`${displayLabel} QR`}
                    width={150}
                    height={150}
                    style={{
                      display: 'block',
                      width: 150,
                      height: 150,
                      maxWidth: 'none',
                      objectFit: 'contain',
                      borderRadius: 8,
                    }}
                  />
                </span>
              )}
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt={displayLabel}
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    config?.bg ?? 'bg-[#6b7280]',
                  )}
                >
                  <span className="text-[10px] font-bold text-white">
                    {displayLabel[0]}
                  </span>
                </span>
              )}
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
        data-ga-id="floating-cta.toggle"
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
