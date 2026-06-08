'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import type { ReconcileStatus } from '@/lib/store/useReconciledCart';

interface CartItemData {
  id: string;
  name: string;
  packageLabel: string;
  unitPrice: number;
  quantity: number;
  status?: ReconcileStatus;
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}

function formatPrice(price: number): string {
  return `₩${price.toLocaleString('ko-KR')}`;
}

function CartItem({
  item,
  onQuantityChange,
  onRemove,
  className,
}: CartItemProps) {
  const t = useTranslations('estimate');
  const removed = item.status === 'removed';

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-[8px] bg-white p-4',
        removed && 'opacity-60',
        className,
      )}
    >
      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h4 className="text-forever-charcoal truncate text-[14px] font-bold">
            {item.name}
          </h4>
          {removed && (
            <span className="inline-flex shrink-0 items-center rounded-[3px] bg-[#9a9a9a] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {t('discontinued')}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12px] text-[#808080]">{item.packageLabel}</p>
        {removed && (
          <p className="mt-0.5 text-[11px] text-[#b0413f]">
            {t('discontinuedHint')}
          </p>
        )}
      </div>

      {/* Quantity controls — 종료 상품은 숨김(삭제만 가능) */}
      {!removed && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 0}
            data-ga-id={`estimate-cart.qty-minus-${item.id}`}
            className="text-forever-charcoal flex size-7 items-center justify-center rounded-full bg-[#f3edea] text-[14px] font-medium transition-colors hover:bg-[#e5ddd8] disabled:opacity-30"
            aria-label={t('decreaseQuantity')}
          >
            −
          </button>
          <span
            className={cn(
              'w-6 text-center text-[14px] font-medium',
              item.quantity === 0 && 'text-[#999]',
            )}
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            data-ga-id={`estimate-cart.qty-plus-${item.id}`}
            className="text-forever-charcoal flex size-7 items-center justify-center rounded-full bg-[#f3edea] text-[14px] font-medium transition-colors hover:bg-[#e5ddd8]"
            aria-label={t('increaseQuantity')}
          >
            +
          </button>
        </div>
      )}

      {/* Price */}
      <span className="min-w-[100px] text-right">
        {removed ? (
          <span className="text-[13px] text-[#b0b0b0] line-through">
            {formatPrice(item.unitPrice * item.quantity)}
          </span>
        ) : (
          <span className="text-forever-charcoal text-[15px] font-bold">
            {formatPrice(item.unitPrice * item.quantity)}
          </span>
        )}
      </span>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        data-ga-id={`estimate-cart.remove-${item.id}`}
        className="ml-2 flex size-7 shrink-0 items-center justify-center rounded-full text-[14px] text-[#999] transition-colors hover:bg-[#f3edea] hover:text-[#2b2b2b]"
        aria-label={t('removeItem')}
      >
        ✕
      </button>
    </div>
  );
}

export { CartItem, formatPrice, type CartItemData, type CartItemProps };
