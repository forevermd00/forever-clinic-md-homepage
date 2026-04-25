'use client';

import { useState } from 'react';
import Link from 'next/link';

export function ContactFormSection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  return (
    <section className="flex flex-col items-center gap-6 bg-[#faf8f5] px-4 py-16 md:px-[300px]">
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
              placeholder="이름을 입력해 주세요"
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
              placeholder="연락처를 입력해 주세요"
              className="h-[44px] rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
            />
          </div>
        </div>

        {/* Row 2: 관심 시술 (cart items) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#2b2b2b]">
            관심 시술
          </label>
          <div className="rounded-[6px] border border-[#efe5d9] bg-white">
            <div className="border-b border-[#efe5d9] px-3.5 py-3 text-[13px] text-[#2b2b2b]">
              ☑ 울쎄라 리프팅 3회 패키지
            </div>
            <div className="border-b border-[#efe5d9] px-3.5 py-3 text-[13px] text-[#2b2b2b]">
              ☑ 써마지 FLX 1회
            </div>
            <Link
              href="/ko/treatments"
              className="block px-3.5 py-3 text-[12px] font-medium text-[#a83c44]"
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
            placeholder="문의 내용을 입력해 주세요"
            className="h-[100px] resize-none rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
          />
        </div>

        {/* Note */}
        <p className="text-[11px] text-[#999]">
          ※ 성함, 연락처 외 모든 항목은 선택사항입니다
        </p>

        {/* Submit button */}
        <div className="flex justify-center">
          <button
            type="button"
            className="rounded-[4px] bg-[#2b2b2b] px-12 py-4 text-[15px] font-bold text-white transition-colors hover:bg-[#1a1a1a]"
          >
            문의하기
          </button>
        </div>
      </div>
    </section>
  );
}
