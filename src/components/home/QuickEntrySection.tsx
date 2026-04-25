'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { id: 'treatment', label: '시술로 찾기' },
  { id: 'concern', label: '고민으로 찾기' },
  { id: 'situation', label: '상황으로 찾기' },
];

const CARDS_BY_TAB: Record<
  string,
  { id: string; title: string; description: string }[]
> = {
  treatment: [
    {
      id: 't1',
      title: '리프팅',
      description: '처진 피부를 끌어올려 탄력을 되찾아 드립니다',
    },
    {
      id: 't2',
      title: '피부케어',
      description: '건강한 피부 본연의 광채를 되살리는 케어',
    },
    {
      id: 't3',
      title: '토닝·색소',
      description: '균일한 피부톤으로 맑은 인상을 완성합니다',
    },
    {
      id: 't4',
      title: '보톡스·필러',
      description: '자연스러운 볼륨과 라인으로 아름다움을',
    },
  ],
  concern: [
    {
      id: 'c1',
      title: '주름·처짐',
      description: '나이 들어 보이는 주름과 처진 피부 개선',
    },
    {
      id: 'c2',
      title: '색소·잡티',
      description: '기미, 주근깨 등 고르지 못한 피부톤 해결',
    },
    {
      id: 'c3',
      title: '모공·피부결',
      description: '넓은 모공과 거친 피부결 매끈하게',
    },
    {
      id: 'c4',
      title: '볼륨·윤곽',
      description: '꺼진 볼륨과 윤곽선을 자연스럽게 회복',
    },
  ],
  situation: [
    {
      id: 's1',
      title: '결혼 준비',
      description: '웨딩 D-day를 위한 맞춤 피부 관리 플랜',
    },
    {
      id: 's2',
      title: '면접 준비',
      description: '자신감 있는 첫인상을 위한 빠른 개선',
    },
    {
      id: 's3',
      title: '여행 전 관리',
      description: '여행 사진이 잘 나오는 피부 컨디션',
    },
    {
      id: 's4',
      title: '시술 후 유지',
      description: '기존 시술 효과를 오래 유지하는 관리',
    },
  ],
};

export function QuickEntrySection() {
  const [activeTab, setActiveTab] = useState('treatment');
  const cards = CARDS_BY_TAB[activeTab];

  return (
    <section className="flex flex-col items-center gap-8 bg-[#faf8f5] px-4 py-16 md:px-12">
      <h2 className="text-center text-[36px] font-bold text-[#2b2b2b]">
        원하는 시술을 선택하세요
      </h2>

      {/* Tabs — square, no border-radius */}
      <div className="flex flex-wrap justify-center gap-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-6 py-3 text-[14px] font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-[#a83c44] text-white'
                : 'bg-transparent text-[#2b2b2b] hover:bg-[#2b2b2b]/5',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {cards.map((card) => (
          <Link
            key={card.id}
            href="/ko/treatments"
            className="w-[300px] overflow-hidden rounded-[8px] bg-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)] transition-shadow hover:drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
          >
            {/* Image placeholder */}
            <div className="bg-forever-beige h-[160px] w-full" />
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
    </section>
  );
}
