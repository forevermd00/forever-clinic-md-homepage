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
  { id: string; title: string; description: string; image: string }[]
> = {
  treatment: [
    {
      id: 't1',
      title: '리프팅',
      description: '처진 피부를 끌어올려 탄력을 되찾아 드립니다',
      image: '/images/home/qe-lifting.png',
    },
    {
      id: 't2',
      title: '피부케어',
      description: '건강한 피부 본연의 광채를 되살리는 케어',
      image: '/images/home/qe-skincare.png',
    },
    {
      id: 't3',
      title: '토닝·색소',
      description: '균일한 피부톤으로 맑은 인상을 완성합니다',
      image: '/images/home/qe-toning.png',
    },
    {
      id: 't4',
      title: '보톡스·필러',
      description: '자연스러운 볼륨과 라인으로 아름다움을',
      image: '/images/home/qe-botox.jpg',
    },
  ],
  concern: [
    {
      id: 'c1',
      title: '주름·처짐',
      description: '나이 들어 보이는 주름과 처진 피부 개선',
      image: '/images/home/qe-concern-wrinkle.png',
    },
    {
      id: 'c2',
      title: '색소·잡티',
      description: '기미, 주근깨 등 고르지 못한 피부톤 해결',
      image: '/images/home/qe-concern-pigment.png',
    },
    {
      id: 'c3',
      title: '모공·피부결',
      description: '넓은 모공과 거친 피부결 매끈하게',
      image: '/images/home/qe-concern-pore.png',
    },
    {
      id: 'c4',
      title: '볼륨·윤곽',
      description: '꺼진 볼륨과 윤곽선을 자연스럽게 회복',
      image: '/images/home/qe-concern-volume.png',
    },
  ],
  situation: [
    {
      id: 's1',
      title: '특별한 날 준비',
      description: '웨딩 D-day를 위한 맞춤 피부 관리 플랜',
      image: '/images/home/qe-situation-special.png',
    },
    {
      id: 's2',
      title: '정기 관리',
      description: '지속적인 피부 컨디션 유지 관리',
      image: '/images/home/qe-situation-regular.png',
    },
    {
      id: 's3',
      title: '빠른 시술',
      description: '바쁜 일정 속 빠르게 효과를 보는 시술',
      image: '/images/home/qe-situation-quick.png',
    },
    {
      id: 's4',
      title: '처음 방문',
      description: '피부과가 처음이신 분을 위한 가이드',
      image: '/images/home/qe-situation-first.png',
    },
  ],
};

export function QuickEntrySection() {
  const [activeTab, setActiveTab] = useState('treatment');
  const cards = CARDS_BY_TAB[activeTab];

  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-8 px-5 py-16 md:px-10 lg:px-12">
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
