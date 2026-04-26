'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CartItem, type CartItemData } from '@/components/estimate/CartItem';
import { CartSummary } from '@/components/estimate/CartSummary';

const INITIAL_CART_ITEMS: CartItemData[] = [
  {
    id: '1',
    name: '울쎄라 리프팅',
    packageLabel: '전체 얼굴 1회',
    unitPrice: 1500000,
    quantity: 1,
  },
  {
    id: '2',
    name: '써마지 FLX',
    packageLabel: '눈가 300샷',
    unitPrice: 800000,
    quantity: 1,
  },
  {
    id: '3',
    name: '울쎄라 리프팅',
    packageLabel: '턱선 집중 1회',
    unitPrice: 1500000,
    quantity: 1,
  },
];

const DISCOUNT_RATE = 0.1;

export function EstimateClient({ locale }: { locale: string }) {
  const t = useTranslations('estimate');
  // Filter out quantity-0 items from initial state (simulates reload cleanup)
  const [items, setItems] = useState<CartItemData[]>(() =>
    INITIAL_CART_ITEMS.filter((item) => item.quantity > 0),
  );

  function handleQuantityChange(id: string, quantity: number) {
    if (quantity < 0) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  // Only count items with quantity > 0 for subtotal
  const activeItems = items.filter((item) => item.quantity > 0);
  const subtotal = activeItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discount = Math.round(subtotal * DISCOUNT_RATE);
  const itemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8 lg:flex-row">
        {/* Cart List */}
        <div className="flex-1">
          <h2 className="text-forever-charcoal text-[24px] font-bold">
            {t('myEstimateList')}
          </h2>

          {items.length === 0 ? (
            <div className="mt-6 rounded-[8px] bg-white p-8 text-center text-neutral-500">
              {t('emptyEstimate')}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <CartSummary
          itemCount={itemCount}
          subtotal={subtotal}
          discount={discount}
          locale={locale}
          className="self-start"
        />
      </div>
    </section>
  );
}
