'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface CartItemData {
  id: string;
  name: string;
  packageLabel: string;
  unitPrice: number;
  quantity: number;
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
  onRemove: _onRemove,
  className,
}: CartItemProps) {
  const t = useTranslations('estimate');
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-[8px] bg-white p-4',
        className,
      )}
    >
      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="text-forever-charcoal truncate text-[14px] font-bold">
          {item.name}
        </h4>
        <p className="mt-0.5 text-[12px] text-[#808080]">{item.packageLabel}</p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          disabled={item.quantity <= 0}
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
          className="text-forever-charcoal flex size-7 items-center justify-center rounded-full bg-[#f3edea] text-[14px] font-medium transition-colors hover:bg-[#e5ddd8]"
          aria-label={t('increaseQuantity')}
        >
          +
        </button>
      </div>

      {/* Price */}
      <span className="text-forever-charcoal min-w-[100px] text-right text-[15px] font-bold">
        {formatPrice(item.unitPrice * item.quantity)}
      </span>
    </div>
  );
}

export { CartItem, formatPrice, type CartItemData, type CartItemProps };
