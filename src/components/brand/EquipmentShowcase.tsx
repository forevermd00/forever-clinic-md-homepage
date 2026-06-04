'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
  const total = items.length;

  const goTo = useCallback(
    (index: number) => {
      setSelectedIndex(((index % total) + total) % total);
    },
    [total],
  );

  const prev = useCallback(
    () => goTo(selectedIndex - 1),
    [selectedIndex, goTo],
  );
  const next = useCallback(
    () => goTo(selectedIndex + 1),
    [selectedIndex, goTo],
  );

  // Main image drag (swipe)
  const dragStartX = useRef<number | null>(null);
  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
  };
  const handleDragEnd = (clientX: number) => {
    if (dragStartX.current === null) return;
    const delta = dragStartX.current - clientX;
    if (Math.abs(delta) > 40) {
      delta > 0 ? next() : prev();
    }
    dragStartX.current = null;
  };

  // Thumbnail strip drag (mouse)
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stripDragging = useRef(false);
  const stripStartX = useRef(0);
  const stripScrollLeft = useRef(0);

  // Keep the selected thumbnail visible within the strip
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = thumbRefs.current[selectedIndex];
    if (!strip || !thumb) return;
    const stripWidth = strip.clientWidth;
    const target = thumb.offsetLeft - stripWidth / 2 + thumb.clientWidth / 2;
    strip.scrollTo({
      left: Math.max(0, target),
      behavior: 'smooth',
    });
  }, [selectedIndex]);

  const onStripMouseDown = (e: React.MouseEvent) => {
    if (!stripRef.current) return;
    stripDragging.current = true;
    stripStartX.current = e.pageX - stripRef.current.offsetLeft;
    stripScrollLeft.current = stripRef.current.scrollLeft;
  };
  const onStripMouseMove = (e: React.MouseEvent) => {
    if (!stripDragging.current || !stripRef.current) return;
    e.preventDefault();
    const x = e.pageX - stripRef.current.offsetLeft;
    stripRef.current.scrollLeft =
      stripScrollLeft.current - (x - stripStartX.current);
  };
  const onStripMouseUp = () => {
    stripDragging.current = false;
  };

  return (
    <div className={cn('relative flex flex-col gap-8', className)}>
      {/* Arrow: left */}
      <button
        type="button"
        onClick={prev}
        aria-label="이전 장비"
        className="absolute top-[40%] left-[-28px] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-[#a83c44] transition-opacity hover:opacity-70 lg:left-[-40px]"
      >
        <svg
          width="28"
          height="52"
          viewBox="0 0 28 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M26 2L2 26L26 50"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Arrow: right */}
      <button
        type="button"
        onClick={next}
        aria-label="다음 장비"
        className="absolute top-[40%] right-[-28px] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-[#a83c44] transition-opacity hover:opacity-70 lg:right-[-40px]"
      >
        <svg
          width="28"
          height="52"
          viewBox="0 0 28 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 2L26 26L2 50"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Main display */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Selected image — draggable/swipeable */}
        <div
          className="h-[320px] w-full cursor-grab overflow-hidden rounded-[12px] bg-[#faf8f5] select-none active:cursor-grabbing lg:h-[480px] lg:max-w-[560px]"
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseUp={(e) => handleDragEnd(e.clientX)}
          onMouseLeave={() => {
            dragStartX.current = null;
          }}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
        >
          {selected.image ? (
            <img
              src={selected.image.src}
              alt={selected.image.alt}
              className="h-full w-full object-contain"
              draggable={false}
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

      {/* Thumbnail strip — mouse drag + touch scroll */}
      <div
        ref={stripRef}
        className="scrollbar-hide flex cursor-grab gap-3 overflow-x-auto px-1 py-1.5 select-none active:cursor-grabbing"
        onMouseDown={onStripMouseDown}
        onMouseMove={onStripMouseMove}
        onMouseUp={onStripMouseUp}
        onMouseLeave={onStripMouseUp}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              thumbRefs.current[index] = el;
            }}
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
                draggable={false}
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
