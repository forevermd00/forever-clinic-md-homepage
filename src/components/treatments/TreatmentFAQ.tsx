'use client';

import { useState } from 'react';

interface Props {
  items: { q: string; a: string }[];
}

export function TreatmentFAQ({ items }: Props) {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  }

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openSet.has(i);
        return (
          <div
            key={i}
            className="cursor-pointer border-b border-[#e6e6e6] py-4"
            onClick={() => toggle(i)}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center">
                <span className="mr-3 shrink-0 text-[14px] font-bold text-[#a83c44]">
                  Q
                </span>
                <span className="flex-1 text-[14px] font-medium text-[#2b2b2b]">
                  {item.q}
                </span>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={`ml-3 h-4 w-4 shrink-0 text-[#999] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}
            >
              <p className="pt-3 pb-1 pl-6 text-[14px] leading-[1.8] text-[#666]">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
