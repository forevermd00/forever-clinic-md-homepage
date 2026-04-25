'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

const channels = [
  {
    label: 'KakaoTalk',
    initial: 'K',
    href: '#kakao',
    color: 'bg-[#FEE500] text-[#191919]',
  },
  {
    label: 'LINE',
    initial: 'L',
    href: '#line',
    color: 'bg-[#06C755] text-white',
  },
  {
    label: 'WeChat',
    initial: 'W',
    href: '#wechat',
    color: 'bg-[#07C160] text-white',
  },
  {
    label: 'WhatsApp',
    initial: 'W',
    href: '#whatsapp',
    color: 'bg-[#25D366] text-white',
  },
] as const;

export function FloatingCTA() {
  // Default: expanded. Click to collapse.
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className="fixed right-6 bottom-6 z-[900] md:right-8 md:bottom-8"
      role="region"
      aria-label="Contact options"
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
        {channels.map(({ label, initial, href, color }, i) => (
          <a
            key={label}
            href={href}
            title={label}
            className="flex items-center gap-3 rounded-[8px] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
            style={{ transitionDelay: isOpen ? `${i * 30}ms` : '0ms' }}
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-[14px] font-bold',
                color,
              )}
            >
              {initial}
            </span>
            <span className="text-[14px] font-medium whitespace-nowrap text-[#353535]">
              {label}
            </span>
          </a>
        ))}
      </div>

      {/* Main FAB button — click to toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex size-14 items-center justify-center rounded-full bg-[#840202] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:scale-110',
          !isOpen && 'rotate-0',
          isOpen && 'rotate-0',
        )}
        aria-label={isOpen ? 'Close chat options' : 'Open chat options'}
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
