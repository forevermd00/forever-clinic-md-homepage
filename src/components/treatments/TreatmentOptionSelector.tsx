'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, type CartItem } from '@/lib/store/cart';

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
  eventBadge: string;
  won: string;
}

interface Props {
  options: SelectorOption[];
  treatmentSlug: string;
  treatmentName: string;
  category: string;
  locale: string;
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
  locale,
  labels,
}: Props) {
  const router = useRouter();
  const setItems = useCartStore((s) => s.setItems);
  const [qty, setQty] = useState<Record<number, number>>({});

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
    const items: CartItem[] = [];
    options.forEach((opt, i) => {
      const quantity = qty[i] ?? 0;
      if (quantity <= 0) return;
      const labelParts = [opt.area, opt.name, opt.caption]
        .filter(Boolean)
        .join(' · ');
      items.push({
        id: `${treatmentSlug}::${i}`,
        treatmentSlug,
        treatmentName,
        packageLabel: labelParts || treatmentName,
        unitPrice: effective(opt),
        quantity,
        category,
      });
    });
    if (items.length === 0) return;
    setItems(items);
    router.push(`/${locale}/estimate`);
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#ece3d8] bg-white shadow-[0_4px_24px_rgba(168,60,68,0.06)]">
      {/* Header */}
      <div className="bg-[#2b2b2b] px-5 py-2.5">
        <h3 className="text-[14px] font-bold tracking-[0.01em] text-white">
          {labels.selectTreatment}
        </h3>
      </div>

      {/* Options */}
      <div className="max-h-[420px] overflow-y-auto">
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
                          hasDiscount ? 'text-[#a83c44]' : 'text-[#2b2b2b]'
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

      {/* Estimated total */}
      <div className="flex items-center justify-between border-t border-[#f0e9df] bg-[#faf7f3] px-5 py-3">
        <span className="text-[14px] font-bold text-[#2b2b2b]">
          {labels.estimatedAmount}
        </span>
        <span className="text-[19px] leading-none font-extrabold text-[#a83c44]">
          {fmt(total)}
          {labels.won}
        </span>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleBook}
        disabled={selectedCount === 0}
        className="w-full bg-[#a83c44] py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#8f3038] disabled:cursor-not-allowed disabled:bg-[#d8cfc4] disabled:text-white"
      >
        {labels.book}
      </button>
    </div>
  );
}
