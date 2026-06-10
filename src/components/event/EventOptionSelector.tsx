'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCartStore } from '@/lib/store/cart';

export interface EventSelectorOption {
  key?: string;
  name: string;
  caption?: string;
  area?: string;
  price: number;
  discountPrice?: number;
  isEvent?: boolean;
}

export interface EventSelectorTreatment {
  slug: string;
  name: string;
  category: string;
  options: EventSelectorOption[];
}

interface Labels {
  selectTreatment: string;
  estimatedAmount: string;
  book: string;
  added: string;
  eventBadge: string;
  won: string;
}

interface Props {
  treatments: EventSelectorTreatment[];
  labels: Labels;
}

interface FlatOption extends EventSelectorOption {
  treatmentSlug: string;
  treatmentName: string;
  category: string;
}

function effective(opt: EventSelectorOption): number {
  return opt.discountPrice && opt.discountPrice > 0
    ? opt.discountPrice
    : opt.price;
}

/**
 * 이벤트 상세 하단 시술 선택 창.
 * 시술 상세의 TreatmentOptionSelector와 동일한 UX(하단 고정 바 + 펼침 목록 + 견적 담기)를
 * 사용하되, 여러 시술을 그룹으로 묶어 한 번에 견적에 담을 수 있게 한다.
 */
export function EventOptionSelector({ treatments, labels }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  // 모든 시술의 옵션을 평탄화 (index 기반 수량 관리)
  const flat = useMemo<FlatOption[]>(
    () =>
      treatments.flatMap((t) =>
        t.options.map((o) => ({
          ...o,
          treatmentSlug: t.slug,
          treatmentName: t.name,
          category: t.category,
        })),
      ),
    [treatments],
  );

  // 시술별 그룹 (첫 등장 순서 유지)
  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, { index: number; opt: FlatOption }[]>();
    let i = 0;
    for (const t of treatments) {
      for (const o of t.options) {
        if (!map.has(t.slug)) {
          map.set(t.slug, []);
          order.push(t.slug);
        }
        map.get(t.slug)!.push({
          index: i,
          opt: {
            ...o,
            treatmentSlug: t.slug,
            treatmentName: t.name,
            category: t.category,
          },
        });
        i += 1;
      }
    }
    return order.map((slug) => ({
      slug,
      name: treatments.find((t) => t.slug === slug)?.name ?? '',
      items: map.get(slug)!,
    }));
  }, [treatments]);

  const [qty, setQty] = useState<Record<number, number>>({});
  const [open, setOpen] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(null), 2200);
    return () => clearTimeout(id);
  }, [toastMsg]);

  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const setQuantity = (index: number, next: number) => {
    setQty((prev) => ({ ...prev, [index]: Math.max(0, next) }));
  };

  const total = useMemo(
    () => flat.reduce((sum, opt, i) => sum + effective(opt) * (qty[i] ?? 0), 0),
    [flat, qty],
  );

  const selectedCount = useMemo(
    () => flat.reduce((n, _opt, i) => n + (qty[i] > 0 ? 1 : 0), 0),
    [flat, qty],
  );

  const fmt = (n: number) => n.toLocaleString();

  function handleBook() {
    let added = 0;
    flat.forEach((opt, i) => {
      const quantity = qty[i] ?? 0;
      if (quantity <= 0) return;
      const labelParts = [opt.area, opt.name, opt.caption]
        .filter(Boolean)
        .join(' · ');
      const optionKey = opt.key ?? String(i);
      addItem(
        {
          id: `${opt.treatmentSlug}::${optionKey}`,
          treatmentSlug: opt.treatmentSlug,
          optionKey,
          treatmentName: opt.treatmentName,
          packageLabel: labelParts || opt.treatmentName,
          unitPrice: effective(opt),
          category: opt.category,
        },
        quantity,
      );
      added += 1;
    });
    if (added === 0) return;
    setQty({});
    setToastMsg(labels.added);
  }

  if (flat.length === 0) return null;

  return (
    <>
      {toastMsg && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-[1000] flex justify-center px-4">
          <div className="animate-[fadeIn_200ms_ease-out] rounded-full bg-[#2b2b2b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_24px_rgba(0,0,0,0.2)]">
            {toastMsg}
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-[950] min-[760px]:px-4 min-[760px]:pb-5">
        <div
          ref={panelRef}
          className="w-full overflow-hidden rounded-t-[16px] border-t border-[#ece3d8] bg-white shadow-[0_-6px_30px_rgba(0,0,0,0.13)] min-[760px]:mx-auto min-[760px]:max-w-[760px] min-[760px]:rounded-[16px] min-[760px]:border min-[760px]:shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
        >
          <div
            className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
              open ? 'max-h-[55vh]' : 'max-h-0'
            }`}
          >
            <div className="max-h-[55vh] overflow-y-auto border-b border-[#f0ece6]">
              {groups.map((group) => (
                <div key={group.slug}>
                  <p className="bg-[#faf8f5] px-5 py-1.5 text-[12px] font-semibold tracking-[0.04em] text-[#a83c44]">
                    {group.name}
                  </p>
                  {group.items.map(({ index, opt }) => {
                    const count = qty[index] ?? 0;
                    const active = count > 0;
                    const hasDiscount =
                      !!opt.discountPrice &&
                      opt.discountPrice > 0 &&
                      opt.discountPrice < opt.price;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 border-b border-[#f0ece6] px-5 py-2.5 transition-colors ${
                          active ? 'bg-[#fbf6f6]' : 'bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setQuantity(index, active ? 0 : 1)}
                          data-ga-id={`event-option.select-${opt.treatmentSlug}-${index}`}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            {opt.isEvent && (
                              <span className="inline-flex shrink-0 items-center rounded-[3px] bg-[#a83c44] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {labels.eventBadge}
                              </span>
                            )}
                            <span className="text-[14px] leading-snug font-medium text-[#2b2b2b]">
                              {opt.name}
                            </span>
                          </div>
                          {opt.caption && (
                            <p className="mt-0.5 text-[12px] text-[#9a9a9a]">
                              {opt.caption}
                            </p>
                          )}
                          <div className="mt-1 flex items-baseline gap-1.5">
                            {hasDiscount && (
                              <span className="text-[12px] text-[#bbb] line-through">
                                {fmt(opt.price)}
                                {labels.won}
                              </span>
                            )}
                            <span
                              className={`text-[15px] font-bold ${
                                hasDiscount
                                  ? 'text-[#a83c44]'
                                  : 'text-[#2b2b2b]'
                              }`}
                            >
                              {fmt(effective(opt))}
                              {labels.won}
                            </span>
                          </div>
                        </button>

                        <div className="flex shrink-0 items-center rounded-[6px] border border-[#ddd]">
                          <button
                            type="button"
                            aria-label="minus"
                            onClick={() => setQuantity(index, count - 1)}
                            data-ga-id={`event-option.qty-minus-${opt.treatmentSlug}-${index}`}
                            className="flex h-8 w-8 items-center justify-center text-[16px] text-[#666] transition-colors hover:bg-[#f3f3f3] disabled:opacity-30"
                            disabled={count === 0}
                          >
                            −
                          </button>
                          <span className="min-w-[28px] text-center text-[14px] font-semibold text-[#2b2b2b]">
                            {count}
                          </span>
                          <button
                            type="button"
                            aria-label="plus"
                            onClick={() => setQuantity(index, count + 1)}
                            data-ga-id={`event-option.qty-plus-${opt.treatmentSlug}-${index}`}
                            className="flex h-8 w-8 items-center justify-center text-[16px] text-[#666] transition-colors hover:bg-[#f3f3f3]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen((v) => !v);
              }
            }}
            data-ga-id="event-option.toggle"
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 select-none sm:gap-3 sm:px-5 sm:py-3"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden
              className={`h-4 w-4 shrink-0 text-[#2b2b2b] transition-transform duration-300 ${
                open ? 'rotate-180' : ''
              }`}
            >
              <path
                d="M5 12l5-5 5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[13px] font-bold whitespace-nowrap text-[#2b2b2b] sm:text-[14px]">
              {labels.selectTreatment}
            </span>
            {selectedCount > 0 && (
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#a83c44] px-1 text-[11px] font-bold text-white">
                {selectedCount}
              </span>
            )}

            <span className="ml-auto flex shrink-0 flex-col items-end pr-1 leading-tight sm:pr-2">
              <span className="text-[10px] text-[#999] sm:text-[11px]">
                {labels.estimatedAmount}
              </span>
              <span className="text-[16px] font-extrabold text-[#a83c44] sm:text-[18px]">
                {fmt(total)}
                {labels.won}
              </span>
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBook();
              }}
              disabled={selectedCount === 0}
              data-ga-id="event-option.add"
              className="shrink-0 rounded-[8px] bg-[#a83c44] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#8f3038] disabled:cursor-not-allowed disabled:bg-[#d8cfc4] sm:px-6 sm:text-[14px]"
            >
              {labels.book}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
