'use client';

import { useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useCartStore } from '@/lib/store/cart';

export function ContactFormSection() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ko';
  const t = useTranslations('home');
  const tc = useTranslations('common');

  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting || !name || !phone) return;
    setIsSubmitting(true);
    try {
      // TODO: Resend 이메일 발송 API 연동 예정
      // const treatments = activeCartItems
      //   .filter((i) => checkedIds.has(i.id))
      //   .map((i) => `${i.treatmentName} (${i.packageLabel} × ${i.quantity})`);
      // await fetch('/api/contact', { method: 'POST', body: JSON.stringify({ name, phone, treatments, message }) });

      setIsSuccess(true);
      setName('');
      setPhone('');
      setMessage('');
      setCheckedIds(new Set());
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeCartItems = mounted
    ? cartItems.filter((i) => i.quantity > 0)
    : [];

  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 lg:px-12">
        <div className="mx-auto flex max-w-[840px] flex-col items-center gap-6">
          <h2 className="text-[28px] font-bold">{t('contactTitle')}</h2>
          <p className="text-[15px] text-[#808080]">{t('contactSubtitle')}</p>

          <div className="flex w-full flex-col gap-5">
            {/* Row 1: Name + Phone */}
            <div className="flex flex-col gap-5 md:flex-row">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#2b2b2b]">
                  {t('formName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('formNamePlaceholder')}
                  className="h-[44px] rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#2b2b2b]">
                  {t('formPhone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="h-[44px] rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
                />
              </div>
            </div>

            {/* Row 2: Cart treatments with quantity controls */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#2b2b2b]">
                {t('formTreatmentInterest')}
              </label>
              <div className="overflow-hidden rounded-[6px] border border-[#efe5d9] bg-white">
                {activeCartItems.length > 0 ? (
                  activeCartItems.map((item) => {
                    const isChecked = checkedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 border-b border-[#faf8f5] px-3.5 py-2.5"
                      >
                        {/* Checkbox */}
                        <label className="flex cursor-pointer items-center">
                          <span
                            className={cn(
                              'flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors',
                              isChecked
                                ? 'border-[#a83c44] bg-[#a83c44]'
                                : 'border-[#d5cabe] bg-white',
                            )}
                          >
                            {isChecked && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M2.5 6L5 8.5L9.5 4"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(item.id)}
                            className="sr-only"
                          />
                        </label>
                        {/* Name */}
                        <span className="flex-1 text-[13px] text-[#2b2b2b]">
                          {item.treatmentName}
                          <span className="ml-1.5 text-[11px] text-[#999]">
                            {item.packageLabel}
                          </span>
                        </span>
                        {/* Quantity */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity <= 1
                                ? removeItem(item.id)
                                : updateQuantity(item.id, item.quantity - 1)
                            }
                            className="flex size-6 items-center justify-center rounded-full bg-[#f3edea] text-[12px] text-[#2b2b2b]"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-[13px] font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="flex size-6 items-center justify-center rounded-full bg-[#f3edea] text-[12px] text-[#2b2b2b]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3.5 py-4 text-center text-[13px] text-[#999]">
                    {t('emptyCartNote')}
                  </div>
                )}
                <Link
                  href={`/${locale}/treatments`}
                  className="flex items-center justify-center py-2.5 text-[12px] font-medium text-[#a83c44] transition-colors hover:bg-[#faf8f5]"
                >
                  + {tc('exploreTreatments')}
                </Link>
              </div>
              <p className="text-[11px] text-[#999]">
                {t('treatmentOptionalNote')}
              </p>
            </div>

            {/* Row 3: Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#2b2b2b]">
                {t('formMessage')}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('formMessagePlaceholder')}
                className="h-[100px] resize-none rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
              />
            </div>

            <p className="text-center text-[11px] text-[#999]">
              {t('formOptionalNote')}
            </p>

            {isSuccess && (
              <div className="rounded-[6px] bg-[#e8f5e9] px-4 py-3 text-center text-[14px] text-[#2e7d32]">
                {t('submitSuccess')}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-[4px] bg-[#2b2b2b] px-12 py-4 text-[15px] font-bold text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50"
              >
                {isSubmitting ? t('submitting') : tc('submit')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
