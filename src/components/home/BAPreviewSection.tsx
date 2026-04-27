'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { BALockOverlay } from '@/components/ba/BALockOverlay';
import type { BACase } from '@/lib/data/ba';

const FILTER_KEYS = [
  { id: 'all', key: 'filterAll' },
  { id: 'lifting', key: 'filterLifting' },
  { id: 'skincare', key: 'filterSkincare' },
  { id: 'toning', key: 'filterToning' },
  { id: 'botox', key: 'filterBotox' },
] as const;

/* Fallback BA cards - used when CMS data is not provided */
const FALLBACK_BA_CARDS = [
  { id: 1, treatment: '울쎄라 리프팅', sessions: '3회 시술' },
  { id: 2, treatment: '피코레이저 토닝', sessions: '5회 시술' },
  { id: 3, treatment: '보톡스 턱라인', sessions: '1회 시술' },
];

interface BAPreviewSectionProps {
  cases?: BACase[];
}

export function BAPreviewSection({ cases }: BAPreviewSectionProps = {}) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ko';
  const t = useTranslations('ba');
  const tc = useTranslations('common');
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <section className="bg-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-6 px-5 py-12 md:px-10 lg:px-12">
        <h2 className="text-[28px] font-bold">{t('title')}</h2>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTER_KEYS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'rounded-[20px] px-4 py-2 text-[13px] font-medium transition-colors',
                activeFilter === filter.id
                  ? 'bg-[#2b2b2b] text-white'
                  : 'border border-[#efe5d9] bg-white text-[#2b2b2b] hover:bg-[#2b2b2b]/5',
              )}
            >
              {t(filter.key)}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-5">
          {(cases && cases.length > 0
            ? cases.map((c) => ({
                id: c._id,
                treatment: c.treatment?.name || '',
                sessions: c.sessions || '',
                beforeImage: c.beforeImage,
                afterImage: c.afterImage,
                category: c.treatment?.category,
              }))
            : FALLBACK_BA_CARDS.map((c) => ({
                ...c,
                id: String(c.id),
                beforeImage: undefined as string | undefined,
                afterImage: undefined as string | undefined,
                category: undefined as string | undefined,
              }))
          )
            .filter(
              (card) =>
                activeFilter === 'all' || card.category === activeFilter,
            )
            .map((card) => (
              <Link
                key={card.id}
                href={`/${locale}/before-after/${card.id}`}
                className="block w-[311px] overflow-hidden rounded-[8px] border border-[#efe5d9] shadow-[0px_1px_2px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md"
              >
                <div className="flex h-[250px]">
                  <div className="flex-1 overflow-hidden">
                    <BALockOverlay locale={locale} className="h-[250px] w-full">
                      {card.beforeImage ? (
                        <img
                          src={card.beforeImage}
                          alt="BEFORE"
                          className="h-[250px] w-full object-cover"
                        />
                      ) : (
                        <div className="h-[250px] w-full bg-[#f3eee6]" />
                      )}
                    </BALockOverlay>
                  </div>
                  <div className="flex-1 bg-[#e0d2b6]" />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-forever-charcoal text-[15px] font-bold">
                    {card.treatment}
                  </span>
                  <span className="text-[13px] text-[#706263]">
                    {card.sessions}
                  </span>
                </div>
              </Link>
            ))}
        </div>

        {/* CTA button */}
        <Link
          href={`/${locale}/before-after`}
          className="rounded-[4px] border border-[#efe5d9] px-6 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b]/5"
        >
          {tc('baViewMore')} &rarr;
        </Link>
      </div>
    </section>
  );
}
