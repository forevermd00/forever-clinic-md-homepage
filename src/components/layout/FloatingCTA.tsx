'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

const channels = [
  {
    label: 'KakaoTalk',
    initial: 'K',
    href: '#',
    color: 'bg-[#FEE500] text-[#191919]',
  },
  { label: 'LINE', initial: 'L', href: '#', color: 'bg-[#06C755] text-white' },
  {
    label: 'WeChat',
    initial: 'W',
    href: '#',
    color: 'bg-[#07C160] text-white',
  },
  {
    label: 'WhatsApp',
    initial: 'W',
    href: '#',
    color: 'bg-[#25D366] text-white',
  },
] as const;

export function FloatingCTA() {
  const [isOpen, setIsOpen] = useState(false);

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
            className={cn(
              'flex items-center gap-3 rounded-[var(--radius-card)] bg-white px-4 py-3 shadow-[var(--shadow-2)] transition-all duration-200 hover:shadow-[var(--shadow-3)]',
            )}
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
            <span className="text-forever-charcoal text-[14px] font-medium whitespace-nowrap">
              {label}
            </span>
          </a>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'bg-forever-red flex size-14 items-center justify-center rounded-full shadow-[var(--shadow-3)] transition-transform duration-200 hover:scale-110',
          isOpen && 'rotate-45',
        )}
        aria-label={isOpen ? 'Close chat options' : 'Open chat options'}
      >
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
      </button>
    </div>
  );
}
