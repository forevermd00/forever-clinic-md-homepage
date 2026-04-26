'use client';

import { useSyncExternalStore } from 'react';
import { useCartStore } from '@/lib/store/cart';

export function CartBadge() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const items = useCartStore((s) => s.items);

  if (!mounted) return null;

  const count = items.filter((i) => i.quantity > 0).length;

  if (count === 0) return null;

  return (
    <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-[#a83c44] text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}
