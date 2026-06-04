'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCartStore } from '@/lib/store/cart';

export interface SelectorOption {
  name: string;
  caption?: string;
  area?: string;
  price: number;
  discountPrice?: number;
  isEvent?: boolean;
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
  options: SelectorOption[];
  treatmentSlug: string;
  treatmentName: string;
  category: string;
  labels: Labels;
}

function effective(opt: SelectorOption): number {
  return opt.discountPrice && opt.discountPrice > 0
    ? opt.discountPrice
    : opt.price;
}

export function TreatmentOptionSelector({
  options,
  treatmentSlug,
  treatmentName,
  category,
  labels,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  // 단일 옵션이면 1개 선택 상태로 시작 (펼치지 않아도 바로 담기 가능)
  const [qty, setQty] = useState<Record<number, number>>(
    options.length === 1 ? { 0: 1 } : {},
  );
  // 진입 시 기본 펼침
  const [open, setOpen] = useState(true);
  // 견적 추가 토스트
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(null), 2200);
    return () => clearTimeout(id);
  }, [toastMsg]);

  // 펼쳐진 상태에서 패널 외부 클릭 시 접기
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

  // area 기준 그룹핑 (첫 등장 순서 유지, area 없는 옵션은 빈 그룹)
  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, { index: number; opt: SelectorOption }[]>();
    options.forEach((opt, index) => {
      const key = opt.area?.trim() || '';
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push({ index, opt });
    });
    return order.map((key) => ({ area: key, items: map.get(key)! }));
  }, [options]);

  const setQuantity = (index: number, next: number) => {
    setQty((prev) => ({ ...prev, [index]: Math.max(0, next) }));
  };

  const total = useMemo(
    () =>
      options.reduce((sum, opt, i) => sum + effective(opt) * (qty[i] ?? 0), 0),
    [options, qty],
  );

  const selectedCount = useMemo(
    () => options.reduce((n, _opt, i) => n + (qty[i] > 0 ? 1 : 0), 0),
    [options, qty],
  );

  const fmt = (n: number) => n.toLocaleString();

  function handleBook() {
    let added = 0;
    options.forEach((opt, i) => {
      const quantity = qty[i] ?? 0;
      if (quantity <= 0) return;
      const labelParts = [opt.area, opt.name, opt.caption]
        .filter(Boolean)
        .join(' · ');
      addItem(
        {
          id: `${treatmentSlug}::${i}`,
          treatmentSlug,
          treatmentName,
          packageLabel: labelParts || treatmentName,
          unitPrice: effective(opt),
          category,
        },
        quantity,
      );
      added += 1;
    });
    if (added === 0) return;
    // 선택 정보만 초기화하고 현재 페이지에 그대로 머무름
    setQty({});
    setToastMsg(labels.added);
  }

  return (
    <>
      {/* 견적 추가 토스트 */}
      {toastMsg && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-[1000] flex justify-center px-4">
          <div className="animate-[fadeIn_200ms_ease-out] rounded-full bg-[#2b2b2b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_24px_rgba(0,0,0,0.2)]">
            {toastMsg}
          </div>
        </div>
      )}

      {/* 메신저 플로팅 버튼(z-[900]) 위에 위치 → 겹치는 영역은 선택기가 자연히 덮음 */}
      <div className="fixed inset-x-0 bottom-0 z-[950] min-[760px]:px-4 min-[760px]:pb-5">
        {/* 760px↑: max-width 고정 중앙 아일랜드 / 미만: 풀폭 하단 부착 */}
        <div
          ref={panelRef}
          className="w-full overflow-hidden rounded-t-[16px] border-t border-[#ece3d8] bg-white shadow-[0_-6px_30px_rgba(0,0,0,0.13)] min-[760px]:mx-auto min-[760px]:max-w-[760px] min-[760px]:rounded-[16px] min-[760px]:border min-[760px]:shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
        >
          {/* 펼쳐지는 옵션 목록 */}
          <div
            className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
              open ? 'max-h-[55vh]' : 'max-h-0'
            }`}
          >
            <div className="max-h-[55vh] overflow-y-auto border-b border-[#f0ece6]">
              {groups.map((group) => (
                <div key={group.area || '_'}>
                  {group.area && (
                    <p className="bg-[#faf8f5] px-5 py-1.5 text-[12px] font-semibold tracking-[0.04em] text-[#a83c44]">
                      {group.area}
                    </p>
                  )}
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

                        {/* Quantity stepper */}
                        <div className="flex shrink-0 items-center rounded-[6px] border border-[#ddd]">
                          <button
                            type="button"
                            aria-label="minus"
                            onClick={() => setQuantity(index, count - 1)}
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

          {/* 하단 바 전체(마진 포함)가 토글 — 견적 추가 버튼만 제외 */}
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

            {/* 예상금액 — 클릭 시 토글 */}
            <span className="ml-auto flex shrink-0 flex-col items-end pr-1 leading-tight sm:pr-2">
              <span className="text-[10px] text-[#999] sm:text-[11px]">
                {labels.estimatedAmount}
              </span>
              <span className="text-[16px] font-extrabold text-[#a83c44] sm:text-[18px]">
                {fmt(total)}
                {labels.won}
              </span>
            </span>

            {/* 견적 추가 — 토글 동작 안 함 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBook();
              }}
              disabled={selectedCount === 0}
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
