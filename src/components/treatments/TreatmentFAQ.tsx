'use client';

import { useState } from 'react';

interface Props {
  items: { q: string; a: string }[];
  dark?: boolean;
}

export function TreatmentFAQ({ items, dark = false }: Props) {
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
            className={`cursor-pointer border-b py-4 ${dark ? 'border-white/10' : 'border-[#e6e6e6]'}`}
            data-ga-id={`treatment-faq.item-${i}`}
            onClick={() => toggle(i)}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center">
                <span className="mr-3 shrink-0 text-[14px] font-bold text-[#a83c44]">
                  Q
                </span>
                <span
                  className={`flex-1 text-[14px] font-medium ${dark ? 'text-white' : 'text-[#2b2b2b]'}`}
                >
                  {item.q}
                </span>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={`ml-3 h-4 w-4 shrink-0 transition-transform duration-300 ${dark ? 'text-white/40' : 'text-[#999]'} ${isOpen ? 'rotate-180' : ''}`}
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
              <p
                className={`pt-3 pb-1 pl-6 text-[14px] leading-[1.8] ${dark ? 'text-white/60' : 'text-[#666]'}`}
              >
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
