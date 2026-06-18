'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

type QuickEntryCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  linkUrl?: string;
};

interface SanityTab {
  id: string;
  key: string;
  label: string;
}

interface QuickEntrySectionProps {
  cardsByTab?: Record<string, QuickEntryCard[]>;
  tabs?: SanityTab[];
}

const FALLBACK_TAB_KEYS = [
  { key: 'treatment', i18nKey: 'tabTreatment' },
  { key: 'concern', i18nKey: 'tabConcern' },
  { key: 'situation', i18nKey: 'tabSituation' },
] as const;

export function QuickEntrySection({
  cardsByTab,
  tabs,
}: QuickEntrySectionProps = {}) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ko';
  const t = useTranslations('home');

  const allCards = cardsByTab ?? {};

  // 탭 목록: Sanity 탭 우선, 없으면 fallback
  const resolvedTabs: { id: string; key: string; label: string }[] =
    tabs && tabs.length > 0
      ? tabs.map((tb) => ({
          id: tb.id,
          key: tb.key,
          label: tb.label || tb.key,
        }))
      : FALLBACK_TAB_KEYS.map((ft) => ({
          id: ft.key,
          key: ft.key,
          label: t(ft.i18nKey),
        }));

  const firstKey = resolvedTabs[0]?.id ?? '';
  const [activeTabId, setActiveTabId] = useState(firstKey);

  // 카드 조회: tab._id(reference 방식) 우선, 없으면 tab.key(string 방식) fallback
  function getCards(tab: { id: string; key: string }): QuickEntryCard[] {
    return allCards[tab.id] ?? allCards[tab.key] ?? [];
  }

  const cards = getCards(
    resolvedTabs.find((t) => t.id === activeTabId) ??
      resolvedTabs[0] ?? { id: '', key: '' },
  );

  return (
    <section className="bg-[#faf8f5]" data-ga-section="home-quick-entry">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-8 px-5 py-16 md:px-10 lg:px-12">
        <h2 className="text-center text-[36px] font-bold text-[#2b2b2b]">
          {t('quickEntryTitle')}
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-0">
          {resolvedTabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setActiveTabId(tb.id)}
              data-ga-id={`home-quick-entry.tab-${tb.id}`}
              className={cn(
                'px-6 py-3 text-[14px] font-medium transition-colors',
                activeTabId === tb.id
                  ? 'bg-[#a83c44] text-white'
                  : 'bg-transparent text-[#2b2b2b] hover:bg-[#2b2b2b]/5',
              )}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/${locale}${card.linkUrl || '/treatments'}`}
              data-ga-id={`home-quick-entry.card-${card.id}`}
              className="w-[270px] max-w-full overflow-hidden rounded-[8px] bg-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)] transition-shadow hover:drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
            >
              <div className="h-[160px] w-full overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover"
                />
              </div>
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
