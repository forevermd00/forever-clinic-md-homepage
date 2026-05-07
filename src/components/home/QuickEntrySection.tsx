'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const TAB_IDS = ['treatment', 'concern', 'situation'] as const;

type QuickEntryCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  linkUrl?: string;
};

const TAB_KEYS: Record<string, string> = {
  treatment: 'tabTreatment',
  concern: 'tabConcern',
  situation: 'tabSituation',
};

interface QuickEntrySectionProps {
  cardsByTab?: Record<string, QuickEntryCard[]>;
}

export function QuickEntrySection({ cardsByTab }: QuickEntrySectionProps = {}) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ko';
  const t = useTranslations('home');
  const [activeTab, setActiveTab] = useState('treatment');
  const allCards = cardsByTab ?? {};
  const cards = allCards[activeTab] ?? [];

  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-8 px-5 py-16 md:px-10 lg:px-12">
        <h2 className="text-center text-[36px] font-bold text-[#2b2b2b]">
          {t('quickEntryTitle')}
        </h2>
        <p className="mt-2 text-center text-[14px] text-[#706263]">
          {t('quickEntrySubtitle')}
        </p>

        {/* Tabs - square, no border-radius */}
        <div className="flex flex-wrap justify-center gap-0">
          {TAB_IDS.map((tabId) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={cn(
                'px-6 py-3 text-[14px] font-medium transition-colors',
                activeTab === tabId
                  ? 'bg-[#a83c44] text-white'
                  : 'bg-transparent text-[#2b2b2b] hover:bg-[#2b2b2b]/5',
              )}
            >
              {t(TAB_KEYS[tabId])}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={(() => {
                const base = `/${locale}${card.linkUrl || '/treatments'}`;
                if (card.description && card.linkUrl?.includes('slugs=')) {
                  return `${base}&desc=${encodeURIComponent(card.description)}`;
                }
                return base;
              })()}
              className="w-[270px] overflow-hidden rounded-[8px] bg-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)] transition-shadow hover:drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
            >
              {/* Image */}
              <div className="h-[160px] w-full overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Text */}
              <div className="flex flex-col gap-1 px-4 pt-2 pb-4">
                <h3 className="text-[16px] font-bold text-[#2b2b2b]">
                  {card.title}
                </h3>
                <p className="text-[13px] text-[#706263]">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
