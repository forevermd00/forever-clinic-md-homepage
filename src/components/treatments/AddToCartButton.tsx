'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/store/cart';

interface AddToCartButtonProps {
  treatmentSlug: string;
  treatmentName: string;
  packageLabel: string;
  unitPrice: number;
  category: string;
  label: string;
}

export function AddToCartButton({
  treatmentSlug,
  treatmentName,
  packageLabel,
  unitPrice,
  category,
  label,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const t = useTranslations('common');
  const [showFeedback, setShowFeedback] = useState(false);

  function handleClick() {
    addItem({
      id: `${treatmentSlug}-${packageLabel}`,
      treatmentSlug,
      treatmentName,
      packageLabel,
      unitPrice,
      category,
    });
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        data-ga-id={`add-to-cart-${treatmentSlug}`}
        className="rounded-[4px] bg-[#2b2b2b] px-6 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
      >
        {label}
      </button>
      {showFeedback && (
        <span className="absolute top-full right-0 mt-2 rounded-[4px] bg-[#2b2b2b] px-3 py-1.5 text-[12px] whitespace-nowrap text-white shadow-lg">
          {t('addedToEstimate')}
        </span>
      )}
    </div>
  );
}
