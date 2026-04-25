'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'lifting', label: '리프팅' },
  { id: 'skincare', label: '피부케어' },
  { id: 'toning', label: '토닝·색소' },
  { id: 'botox', label: '보톡스·필러' },
];

const BA_CARDS = [
  { id: 1, treatment: '울쎄라 리프팅', sessions: '3회 시술' },
  { id: 2, treatment: '피코레이저 토닝', sessions: '5회 시술' },
  { id: 3, treatment: '보톡스 턱라인', sessions: '1회 시술' },
];

export function BAPreviewSection() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <section className="flex min-h-[calc(100dvh-4rem)] flex-col bg-white">
      <div className="mx-auto my-auto flex w-full max-w-[1280px] flex-col items-center gap-6 px-5 py-12 md:px-10 lg:px-12">
        <h2 className="text-[28px] font-bold">Before &amp; After</h2>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
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
              {filter.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-5">
          {BA_CARDS.map((card) => (
            <div
              key={card.id}
              className="w-[311px] overflow-hidden rounded-[8px] border border-[#efe5d9] drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              {/* BA image area */}
              <div className="flex h-[250px]">
                <div className="bg-forever-ivory flex flex-1 items-center justify-center">
                  <span className="text-[13px] text-[#706263]">BEFORE</span>
                </div>
                <div className="w-px bg-[#efe5d9]" />
                <div className="bg-forever-beige flex flex-1 items-center justify-center">
                  <span className="text-[13px] text-[#706263]">AFTER</span>
                </div>
              </div>
              {/* Info row */}
              <div className="flex items-center justify-between px-3 pt-2 pb-2.5">
                <span className="text-[15px] font-bold">{card.treatment}</span>
                <span className="text-[13px] text-[#706263]">
                  {card.sessions}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <Link
          href="/ko/before-after"
          className="rounded-[4px] border border-[#efe5d9] px-6 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b]/5"
        >
          Before &amp; After 더보기 →
        </Link>
      </div>
    </section>
  );
}
