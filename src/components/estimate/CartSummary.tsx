'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { formatPrice } from './CartItem';

interface CartSummaryProps {
  itemCount: number;
  subtotal: number;
  discount: number;
  locale: string;
  className?: string;
}

function CartSummary({
  itemCount,
  subtotal,
  discount,
  locale,
  className,
}: CartSummaryProps) {
  const t = useTranslations('estimate');
  const total = subtotal - discount;

  return (
    <div
      className={cn(
        'w-full rounded-[12px] bg-white px-6 py-8 lg:w-[360px]',
        className,
      )}
    >
      <h3 className="text-forever-charcoal text-[18px] font-bold">
        {t('estimateSummary')}
      </h3>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-[14px]">
          <span className="text-neutral-600">
            {t('treatmentCount', { count: itemCount })}
          </span>
          <span className="text-forever-charcoal font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-neutral-600">{t('discountApplied')}</span>
            <span className="font-medium text-[#a83c44]">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
      </div>

      <div className="my-5 h-px bg-neutral-200" />

      <div className="flex items-center justify-between">
        <span className="text-forever-charcoal text-[15px] font-bold">
          {t('totalEstimatedPrice')}
        </span>
        <span className="text-[20px] font-bold text-[#a83c44]">
          {formatPrice(total)}
        </span>
      </div>

      <Link
        href={`/${locale}/contact`}
        data-ga-id="estimate-submit"
        className="mt-6 flex w-full items-center justify-center rounded-[var(--radius-button)] bg-[#2b2b2b] py-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
      >
        {t('requestConsultation')}
      </Link>
    </div>
  );
}

export { CartSummary, type CartSummaryProps };
