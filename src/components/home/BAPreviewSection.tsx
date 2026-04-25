'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SectionLayout } from '@/components/common/SectionLayout';
import { FilterTabs } from '@/components/common/FilterTabs';
import { CardGrid } from '@/components/common/CardGrid';
import { cn } from '@/lib/utils/cn';

interface BAPreviewSectionProps {
  locale?: string;
}

const TABS = [
  { id: 'all', label: '전체' },
  { id: 'lifting', label: '리프팅' },
  { id: 'skincare', label: '스킨케어' },
  { id: 'botox', label: '보톡스·필러' },
];

const BA_CARDS = [
  { id: 1, treatment: '울쎄라 리프팅', sessions: '3회 시술' },
  { id: 2, treatment: '피코레이저 토닝', sessions: '5회 시술' },
  { id: 3, treatment: '보톡스 턱라인', sessions: '1회 시술' },
];

function BAPreviewSection({ locale: _locale }: BAPreviewSectionProps) {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <SectionLayout title="Before & After" background="ivory">
      <FilterTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underline"
        className="mb-8"
      />
      <CardGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
        {BA_CARDS.map((card) => (
          <div
            key={card.id}
            className={cn(
              'overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]',
            )}
          >
            <div className="flex h-[200px]">
              <div className="flex flex-1 items-center justify-center bg-neutral-300">
                <span className="text-[13px] font-medium text-neutral-600">
                  BEFORE
                </span>
              </div>
              <div className="flex flex-1 items-center justify-center bg-neutral-200">
                <span className="text-[13px] font-medium text-neutral-600">
                  AFTER
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-forever-charcoal text-[16px] font-semibold">
                {card.treatment}
              </h3>
              <p className="mt-1 text-[14px] text-neutral-500">
                {card.sessions}
              </p>
            </div>
          </div>
        ))}
      </CardGrid>
      <div className="mt-8">
        <Link
          href="/ko/before-after"
          className="text-forever-red text-[15px] font-medium hover:underline"
        >
          {'B&A 전체 보기 →'}
        </Link>
      </div>
    </SectionLayout>
  );
}

export { BAPreviewSection, type BAPreviewSectionProps };
