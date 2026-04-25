'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const TREATMENTS = [
  { id: 'ulthera', label: '울쎄라 리프팅' },
  { id: 'thermage', label: '써마지 FLX' },
  { id: 'skinbooster', label: '스킨 부스터' },
  { id: 'picotoning', label: '피코토닝' },
  { id: 'botox', label: '보톡스' },
  { id: 'filler', label: '필러' },
];

export function ContactFormSection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

  const toggleTreatment = (id: string) => {
    setSelectedTreatments((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10 lg:px-12">
        <div className="mx-auto flex max-w-[840px] flex-col items-center gap-6">
          <h2 className="text-[28px] font-bold">상담 문의</h2>
          <p className="text-[15px] text-[#808080]">
            궁금하신 점이 있으시면 편하게 문의해 주세요
          </p>

          <div className="flex w-full flex-col gap-5">
            {/* Row 1: 성함 + 연락처 */}
            <div className="flex flex-col gap-5 md:flex-row">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#2b2b2b]">
                  성함
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="성함을 입력해 주세요"
                  className="h-[44px] rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#2b2b2b]">
                  연락처
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="h-[44px] rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
                />
              </div>
            </div>

            {/* Row 2: 관심 시술 — 체크박스 */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#2b2b2b]">
                관심 시술
              </label>
              <div className="overflow-hidden rounded-[6px] border border-[#efe5d9] bg-white">
                {TREATMENTS.map((treatment) => {
                  const isChecked = selectedTreatments.includes(treatment.id);
                  return (
                    <label
                      key={treatment.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-[#faf8f5] px-3.5 py-3 transition-colors hover:bg-[#faf8f5]"
                    >
                      <span
                        className={cn(
                          'flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors',
                          isChecked
                            ? 'border-[#a83c44] bg-[#a83c44]'
                            : 'border-[#d5cabe] bg-white',
                        )}
                      >
                        {isChecked && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2.5 6L5 8.5L9.5 4"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTreatment(treatment.id)}
                        className="sr-only"
                      />
                      <span className="text-[13px] text-[#2b2b2b]">
                        {treatment.label}
                      </span>
                    </label>
                  );
                })}
                <Link
                  href="/ko/treatments"
                  className="flex items-center justify-center py-2.5 text-[12px] font-medium text-[#a83c44] transition-colors hover:bg-[#faf8f5]"
                >
                  + 시술 탐색하기
                </Link>
              </div>
            </div>

            {/* Row 3: 문의 내용 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#2b2b2b]">
                문의 내용
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="문의하실 내용을 입력해 주세요"
                className="h-[100px] resize-none rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
              />
            </div>

            <p className="text-center text-[11px] text-[#999]">
              ※ 성함, 연락처 외 모든 항목은 선택사항입니다
            </p>

            <div className="flex justify-center">
              <button
                type="button"
                className="rounded-[4px] bg-[#2b2b2b] px-12 py-4 text-[15px] font-bold text-white transition-colors hover:bg-[#1a1a1a]"
              >
                문의하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
