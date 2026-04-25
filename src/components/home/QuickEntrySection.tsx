'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { id: 'lifting', label: '리프팅' },
  { id: 'skincare', label: '피부케어' },
  { id: 'toning', label: '토닝·색소' },
  { id: 'botox', label: '보톡스·필러' },
];

const CARDS_BY_TAB: Record<
  string,
  { id: string; title: string; description: string }[]
> = {
  lifting: [
    {
      id: 'l1',
      title: '울쎄라 리프팅',
      description: 'HIFU 초음파로 탄력 개선',
    },
    { id: 'l2', title: '써마지 FLX', description: '고주파 콜라겐 리모델링' },
    {
      id: 'l3',
      title: '실리프팅',
      description: '녹는 실을 이용한 즉각 리프팅',
    },
    {
      id: 'l4',
      title: '인모드 리프팅',
      description: 'RF 에너지 피부 타이트닝',
    },
  ],
  skincare: [
    { id: 's1', title: '아쿠아필', description: '수분 공급 딥클렌징' },
    { id: 's2', title: '리쥬란 힐러', description: 'PN 성분 피부 재생' },
    { id: 's3', title: '엑소좀 부스터', description: '세포 재생 촉진 부스터' },
    { id: 's4', title: '피부 관리 패키지', description: '맞춤 복합 케어' },
  ],
  toning: [
    { id: 't1', title: '피코토닝', description: '색소 및 잡티 개선' },
    { id: 't2', title: '레이저토닝', description: '멜라닌 색소 파괴' },
    { id: 't3', title: 'IPL 광선치료', description: '복합 색소 치료' },
    { id: 't4', title: '미백 관리', description: '브라이트닝 집중 케어' },
  ],
  botox: [
    { id: 'b1', title: '보톡스 주름', description: '표정 주름 개선' },
    { id: 'b2', title: '턱 보톡스', description: '사각턱 라인 교정' },
    { id: 'b3', title: '필러 볼륨', description: '볼륨 및 윤곽 보정' },
    { id: 'b4', title: '스킨 보톡스', description: '피부결 개선 미량 주사' },
  ],
};

export function QuickEntrySection() {
  const [activeTab, setActiveTab] = useState('lifting');
  const cards = CARDS_BY_TAB[activeTab];

  return (
    <section className="flex flex-col items-center gap-8 bg-[#faf8f5] px-4 py-16 md:px-12">
      <h2 className="text-center text-[36px] font-bold">
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
          <div
            key={card.id}
            className="w-[300px] overflow-hidden rounded-[8px] bg-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)]"
          >
            {/* Image placeholder */}
            <div className="bg-forever-beige h-[160px] w-full rounded-t-[8px]" />
            {/* Text */}
            <div className="flex flex-col gap-1 px-4 pt-2 pb-4">
              <h3 className="text-[16px] font-bold text-[#2b2b2b]">
                {card.title}
              </h3>
              <p className="text-[13px] text-[#706263]">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
