'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/store/cart';
import { CartItem } from '@/components/estimate/CartItem';
import { CartSummary } from '@/components/estimate/CartSummary';

export function EstimateClient({ locale }: { locale: string }) {
  const t = useTranslations('estimate');
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // Hydration guard: avoid SSR/client mismatch
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  function handleQuantityChange(id: string, quantity: number) {
    if (quantity < 0) return;
    updateQuantity(id, quantity);
  }

  function handleRemove(id: string) {
    removeItem(id);
  }

  // Only count items with quantity > 0 for subtotal
  const activeItems = items.filter((item) => item.quantity > 0);
  const subtotal = activeItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discount = 0;
  const itemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!mounted) {
    return (
      <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <h2 className="text-forever-charcoal text-[24px] font-bold">
              {t('myEstimateList')}
            </h2>
            <div className="mt-6 rounded-[8px] bg-white p-8 text-center text-neutral-500">
              {t('emptyEstimate')}
            </div>
          </div>
          <CartSummary
            itemCount={0}
            subtotal={0}
            discount={0}
            locale={locale}
            className="self-start"
          />
        </div>
      </section>
    );
  }

  // Map CartStore items to CartItemData shape
  const cartItemData = items.map((item) => ({
    id: item.id,
    name: item.treatmentName,
    packageLabel: item.packageLabel,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
  }));

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
              {cartItemData.map((item) => (
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
