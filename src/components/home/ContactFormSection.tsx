'use client';

import { useState, useSyncExternalStore } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useCartStore } from '@/lib/store/cart';
import type { ContactSectionConfig } from '@/lib/data/clinic';

function formatPhone(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

type Props = {
  config?: ContactSectionConfig;
};

export function ContactFormSection({ config }: Props) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ko';
  const searchParams = useSearchParams();
  const t = useTranslations('home');
  const tc = useTranslations('common');

  const programSlug = searchParams.get('program');
  const programName = searchParams.get('programName');

  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+82');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [message, setMessage] = useState(() =>
    programName ? `시그니처 프로그램 ${programName}에 대해 문의드립니다.` : '',
  );
  const [checkedIds, setCheckedIds] = useState<Set<string> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const headerBgColor = '#1a1a1a';
  const accentColor = '#a83c44';
  const headerTitle = config?.title ?? t('contactTitle');
  const headerSubtitle = config?.subtitle ?? t('contactSubtitle');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhoneDigits(raw);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !name || !phoneDigits) return;
    setIsSubmitting(true);
    try {
      const selectedTreatments = activeCartItems
        .filter((i) => effectiveCheckedIds.has(i.id))
        .map((i) => ({
          treatmentSlug: i.treatmentSlug,
          treatmentName: i.treatmentName,
          packageLabel: i.packageLabel,
          quantity: i.quantity,
        }));

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: `${countryCode} ${formatPhone(phoneDigits)}`,
          message,
          treatments:
            selectedTreatments.length > 0 ? selectedTreatments : undefined,
          source: 'contact-form',
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setName('');
        setPhoneDigits('');
        setMessage('');
        setCheckedIds(null);
      }
    } catch {
      // silent fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCheck = (id: string) => {
    const current = effectiveCheckedIds;
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedIds(next);
  };

  const activeCartItems = mounted
    ? cartItems.filter((i) => i.quantity > 0)
    : [];

  // 기본 전체 선택: checkedIds가 null이면 모든 항목 선택
  const effectiveCheckedIds =
    checkedIds ?? new Set(activeCartItems.map((i) => i.id));

  return (
    <section>
      {/* 헤더 */}
      <div
        className="relative flex flex-col items-center justify-center gap-3 px-5 py-20 text-center"
        style={{
          backgroundImage: 'url(/images/contact-banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      >
        {/* 오버레이 */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: headerBgColor, opacity: 0.55 }}
        />
        {/* 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <p className="text-[11px] font-medium tracking-[3px] text-white/50 uppercase">
            Reservation &amp; Consultation
          </p>
          <h2 className="text-[26px] font-bold text-white lg:text-[32px]">
            {headerTitle}
          </h2>
          <p className="text-[14px] text-white/70">{headerSubtitle}</p>
        </div>
      </div>

      {/* 폼 */}
      <div className="bg-[#faf8f5]">
        <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 lg:px-12">
          <div className="mx-auto flex max-w-[840px] flex-col items-center gap-6">
            {/* 프로그램 배너 */}
            {programSlug && programName && (
              <div className="w-full rounded-[6px] border border-[#a83c44]/40 bg-[#a83c44]/5 px-4 py-3">
                <p className="text-[13px] font-medium text-[#a83c44]">
                  {programName} 상담을 신청합니다
                </p>
              </div>
            )}
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
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-[44px] w-[110px] shrink-0 rounded-[6px] border border-[#d9d9d9] bg-white px-2 text-[13px] text-[#2b2b2b]"
                    >
                      <option value="+82">{'\u{1F1F0}\u{1F1F7}'} +82</option>
                      <option value="+81">{'\u{1F1EF}\u{1F1F5}'} +81</option>
                      <option value="+86">{'\u{1F1E8}\u{1F1F3}'} +86</option>
                      <option value="+1">{'\u{1F1FA}\u{1F1F8}'} +1</option>
                      <option value="+44">{'\u{1F1EC}\u{1F1E7}'} +44</option>
                      <option value="+61">{'\u{1F1E6}\u{1F1FA}'} +61</option>
                      <option value="+65">{'\u{1F1F8}\u{1F1EC}'} +65</option>
                      <option value="+852">{'\u{1F1ED}\u{1F1F0}'} +852</option>
                      <option value="+886">{'\u{1F1F9}\u{1F1FC}'} +886</option>
                      <option value="+66">{'\u{1F1F9}\u{1F1ED}'} +66</option>
                      <option value="+84">{'\u{1F1FB}\u{1F1F3}'} +84</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={formatPhone(phoneDigits)}
                      onChange={handlePhoneChange}
                      placeholder="010-0000-0000"
                      className="h-[44px] flex-1 rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
                    />
                  </div>
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
                      const isChecked = effectiveCheckedIds.has(item.id);
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
                                  ? 'border-transparent'
                                  : 'border-[#d5cabe] bg-white',
                              )}
                              style={
                                isChecked
                                  ? {
                                      backgroundColor: accentColor,
                                      borderColor: accentColor,
                                    }
                                  : undefined
                              }
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
                    className="flex items-center justify-center py-2.5 text-[12px] font-medium transition-colors hover:bg-[#faf8f5]"
                    style={{ color: accentColor }}
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
      </div>
    </section>
  );
}
