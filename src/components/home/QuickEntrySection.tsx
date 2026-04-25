'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SectionLayout } from '@/components/common/SectionLayout';
import { FilterTabs } from '@/components/common/FilterTabs';
import { CardGrid } from '@/components/common/CardGrid';
import { cn } from '@/lib/utils/cn';

interface QuickEntrySectionProps {
  locale?: string;
}

const TABS = [
  { id: 'treatment', label: '시술로 찾기' },
  { id: 'concern', label: '고민으로 찾기' },
  { id: 'situation', label: '상황으로 찾기' },
];

const CARDS_BY_TAB: Record<string, { id: string; title: string }[]> = {
  treatment: [
    { id: 't1', title: '리프팅' },
    { id: 't2', title: '스킨케어·부스터' },
    { id: 't3', title: '색소·미백' },
    { id: 't4', title: '모공·흉터' },
    { id: 't5', title: '보톡스·필러' },
    { id: 't6', title: '제모' },
  ],
  concern: [
    { id: 'c1', title: '주름·탄력' },
    { id: 'c2', title: '기미·잡티' },
    { id: 'c3', title: '여드름·트러블' },
    { id: 'c4', title: '모공·블랙헤드' },
    { id: 'c5', title: '다크서클' },
    { id: 'c6', title: '홍조·민감' },
  ],
  situation: [
    { id: 's1', title: '결혼 전 관리' },
    { id: 's2', title: '여행 전 관리' },
    { id: 's3', title: '계절 관리' },
    { id: 's4', title: '첫 시술' },
    { id: 's5', title: '정기 관리' },
    { id: 's6', title: '특별한 날' },
  ],
};

function QuickEntrySection({ locale: _locale }: QuickEntrySectionProps) {
  const [activeTab, setActiveTab] = useState('treatment');
  const cards = CARDS_BY_TAB[activeTab];

  return (
    <SectionLayout title="무엇을 고민하고 계신가요?" background="ivory">
      <FilterTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="pill"
        className="mb-8"
      />
      <CardGrid columns={{ mobile: 2, tablet: 3, desktop: 6 }} gap="md">
        {cards.map((card) => (
          <Link
            key={card.id}
            href="/ko/treatments"
            className={cn(
              'border-forever-taupe flex flex-col gap-1.5 rounded-[var(--radius-card)] border bg-white p-4',
              'hover:border-forever-red transition-colors duration-200',
            )}
          >
            <div className="bg-forever-taupe size-9 rounded-[4px]" />
            <div className="flex items-center justify-between">
              <span className="text-forever-charcoal text-[15px] font-medium">
                {card.title}
              </span>
              <span className="text-neutral-400">→</span>
            </div>
          </Link>
        ))}
      </CardGrid>
    </SectionLayout>
  );
}

export { QuickEntrySection, type QuickEntrySectionProps };
