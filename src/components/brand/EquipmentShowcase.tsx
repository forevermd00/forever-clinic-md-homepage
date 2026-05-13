'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface EquipmentItem {
  id: string;
  name: string;
  description?: string;
  treatments?: string;
  image?: { src: string; alt: string };
}

interface EquipmentShowcaseProps {
  items: EquipmentItem[];
  className?: string;
}

export function EquipmentShowcase({
  items,
  className,
}: EquipmentShowcaseProps) {
  const t = useTranslations('brand');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = items[selectedIndex];

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Main display: image left + info right */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Selected image */}
        <div className="h-[320px] w-full overflow-hidden rounded-[12px] bg-[#faf8f5] lg:h-[480px] lg:max-w-[560px]">
          {selected.image ? (
            <img
              src={selected.image.src}
              alt={selected.image.alt}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#efe5d9] via-[#e8ddd0] to-[#d4c7bd]">
              <span className="text-[16px] font-medium text-[#b3a89c]">
                {selected.name}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-center gap-4">
          <span className="text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
            EQUIPMENT
          </span>
          <h3 className="text-[24px] font-bold text-[#2b2b2b] lg:text-[28px]">
            {selected.name}
          </h3>
          {selected.description && (
            <p className="text-[14px] leading-[1.7] text-[#706263]">
              {selected.description}
            </p>
          )}
          {selected.treatments && (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#808080]">
                {t('applicableTreatments')}
              </span>
              <span className="text-[13px] text-[#2b2b2b]">
                {selected.treatments}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-1 py-1.5">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'h-[90px] w-[140px] shrink-0 overflow-hidden rounded-[8px] bg-[#faf8f5] transition-all duration-200',
              index === selectedIndex
                ? 'ring-2 ring-[#2b2b2b]'
                : 'opacity-60 hover:opacity-90',
            )}
          >
            {item.image ? (
              <img
                src={item.image.src}
                alt={item.image.alt}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#efe5d9] to-[#d4c7bd]">
                <span className="text-[11px] font-medium text-[#b3a89c]">
                  {item.name}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
