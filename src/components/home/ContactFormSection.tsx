'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useCartStore } from '@/lib/store/cart';
import { useReconciledCart } from '@/lib/store/useReconciledCart';
import { trackFormSubmit } from '@/lib/analytics/events';
import { buildAttribution, clearStoredUtm } from '@/lib/utm';
import type {
  ContactSectionConfig,
  BusinessHoursEntry,
} from '@/lib/data/clinic';
import { FALLBACK_BUSINESS_HOURS } from '@/lib/data/clinic';

/* Sanity 영업시간 기반 시간 슬롯 생성 (30분 단위) */
function getTimeSlots(dateStr: string, hours: BusinessHoursEntry[]): string[] {
  if (!dateStr) return [];
  const date = new Date(dateStr + 'T00:00:00');
  const dow = date.getDay();
  const entry = hours.find((h) => h.dayOfWeek.includes(dow));
  if (!entry) return []; // 해당 요일 영업 없음

  const [openH, openM] = entry.open.split(':').map(Number);
  const [closeH, closeM] = entry.close.split(':').map(Number);
  const openTotal = openH * 60 + openM;
  const closeTotal = closeH * 60 + closeM;

  const slots: string[] = [];
  for (let t = openTotal; t <= closeTotal; t += 30) {
    slots.push(
      `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`,
    );
  }
  return slots;
}

/* 오늘 날짜이면 현재 시각 + 30분 이후 슬롯만 활성화 */
function isSlotAvailable(dateStr: string, slot: string): boolean {
  if (!dateStr) return true;
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  if (dateStr !== today) return true;
  const now = new Date();
  const [h, m] = slot.split(':').map(Number);
  const slotMinutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + 30; // +30분 버퍼
  return slotMinutes >= nowMinutes;
}

/* 날짜 선택 최솟값 (오늘) */
function getTodayStr(): string {
  return new Date().toLocaleDateString('en-CA');
}

/* 메신저 유형 — 라벨은 전 로케일 공통 영어 표기 */
const MESSENGER_TYPES = ['KakaoTalk', 'LINE', 'WeChat', 'WhatsApp'] as const;

const DATE_PLACEHOLDER: Record<string, string> = {
  ko: '연도. 월. 일.',
  en: 'MM / DD / YYYY',
  zh: '年 / 月 / 日',
  ja: '年 / 月 / 日',
};

function formatDateForLocale(iso: string, locale: string): string {
  const [year, month, day] = iso.split('-');
  switch (locale) {
    case 'en':
      return `${month} / ${day} / ${year}`;
    case 'zh':
      return `${year} / ${month} / ${day}`;
    case 'ja':
      return `${year} / ${month} / ${day}`;
    default:
      return `${year}. ${month}. ${day}.`;
  }
}

function formatPhone(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

/* 생년월일 YYYY-MM-DD 마스킹 */
function formatBirthDate(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIRTHDATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/* 실제 달력상 유효한 생년월일인지 검증 (형식 + 월/일 유효 + 미래·과도한 과거 배제) */
function isValidBirthDate(value: string): boolean {
  if (!BIRTHDATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  // 롤오버 검사: 2020-12-34 → 2021-01-03, 2020-02-30 → 03-01 등을 걸러냄
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return false;
  }
  if (y < 1900) return false;
  if (date.getTime() > Date.now()) return false; // 미래 날짜 불가
  return true;
}

type Props = {
  config?: ContactSectionConfig;
  businessHours?: BusinessHoursEntry[];
  showPreferredDatetime?: boolean;
  bannerImageUrl?: string | null;
};

export function ContactFormSection({
  config,
  businessHours,
  showPreferredDatetime = true,
  bannerImageUrl,
}: Props) {
  const hours = businessHours ?? FALLBACK_BUSINESS_HOURS;
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ko';
  const searchParams = useSearchParams();
  const t = useTranslations('home');
  const tc = useTranslations('common');

  const programSlug = searchParams.get('program');
  const programName = searchParams.get('programName');

  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  // 견적 가격을 live 재대조 → 고객이 보는 값 = 전송하는 값 (정합성)
  const { items: reconciledItems, viewedAt } = useReconciledCart(locale);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+82');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [messengerType, setMessengerType] = useState<string>(
    MESSENGER_TYPES[0],
  );
  const [messengerId, setMessengerId] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [message, setMessage] = useState(() =>
    programName ? `시그니처 프로그램 ${programName}에 대해 문의드립니다.` : '',
  );
  const [checkedIds, setCheckedIds] = useState<Set<string> | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // CRM 부서별 예약수 기준으로 마감된 슬롯 (HH:mm)
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);

  // 날짜 선택 시 가용 슬롯 조회 → 한도 초과 슬롯 비활성화
  // (빈 상태로의 초기화는 날짜 변경 핸들러에서 처리 → effect 내 동기 setState 회피)
  useEffect(() => {
    if (!showPreferredDatetime || !preferredDate) return;
    let cancelled = false;
    fetch(`/api/reservation/availability?date=${preferredDate}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setBlockedSlots(
          Array.isArray(data.blockedSlots) ? data.blockedSlots : [],
        );
      })
      .catch(() => {
        if (!cancelled) setBlockedSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [preferredDate, showPreferredDatetime]);

  const headerBgColor = '#1a1a1a';
  const accentColor = '#a83c44';
  const headerTitle = config?.title ?? t('contactTitle');
  const headerSubtitle = config?.subtitle ?? t('contactSubtitle');
  const showDatetime = showPreferredDatetime;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhoneDigits(raw);
  };

  const emailValid = EMAIL_RE.test(email.trim());
  const birthDateValid = isValidBirthDate(birthDate);
  const nameInvalid = !name.trim();
  const phoneInvalid = !phoneDigits;
  const emailInvalid = !email.trim() || !emailValid;
  const birthDateInvalid = !birthDate || !birthDateValid;
  // CRM은 예약 일시가 필수 → 날짜·시간 모두 필수 입력
  const datetimeInvalid =
    showPreferredDatetime && (!preferredDate || !preferredTime);
  const errBorder = (invalid: boolean) =>
    attemptedSubmit && invalid ? 'border-[#a83c44]' : 'border-[#d9d9d9]';

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setAttemptedSubmit(true);
    if (
      nameInvalid ||
      phoneInvalid ||
      emailInvalid ||
      birthDateInvalid ||
      datetimeInvalid
    ) {
      return;
    }
    if (!privacyConsent) {
      setPrivacyError(true);
      return;
    }
    setIsSubmitting(true);
    try {
      // 전송 라인: live 재대조된(=고객이 본) 단가·라벨 + 변동/종료 상태
      const toLine = (i: (typeof activeCartItems)[number]) => ({
        treatmentSlug: i.treatmentSlug,
        treatmentName: i.treatmentName,
        packageLabel: i.displayLabel,
        unitPrice: i.displayUnitPrice,
        priceStatus: i.status,
        quantity: i.quantity,
      });
      const selectedTreatments = activeCartItems
        .filter((i) => effectiveCheckedIds.has(i.id))
        .map(toLine);
      // 견적(장바구니 전체) — etcMemo 기록용
      const estimateItems = activeCartItems.map(toLine);

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          birthDate,
          email: email.trim(),
          phone: `${countryCode} ${formatPhone(phoneDigits)}`,
          cellPhone: phoneDigits, // 국가코드 제외 로컬 숫자 (CRM 등록용)
          messengerType: messengerId.trim() ? messengerType : undefined,
          messengerId: messengerId.trim() || undefined,
          message,
          treatments:
            selectedTreatments.length > 0 ? selectedTreatments : undefined,
          estimateItems: estimateItems.length > 0 ? estimateItems : undefined,
          preferredDate: preferredDate || undefined,
          preferredTime: preferredTime || undefined,
          source: 'contact-form',
          locale,
          attribution: buildAttribution(),
          // 고객이 견적 가격을 마지막으로 확인(재대조)한 시각 — 가격 시점 명시
          viewedAt: viewedAt ? new Date(viewedAt).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        trackFormSubmit('contact-reservation', {
          locale,
          treatment_count: selectedTreatments.length,
          has_preferred_datetime: Boolean(preferredDate),
        });
        setIsSuccess(true);
        // 예약 시점에 UTM 소비 → 저장값 제거
        clearStoredUtm();
        setName('');
        setBirthDate('');
        setEmail('');
        setPhoneDigits('');
        setMessengerType(MESSENGER_TYPES[0]);
        setMessengerId('');
        setMessage('');
        setCheckedIds(null);
        setPreferredDate('');
        setPreferredTime('');
        setPrivacyConsent(false);
        setPrivacyError(false);
        setAttemptedSubmit(false);
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
    ? reconciledItems.filter((i) => i.quantity > 0)
    : [];

  // 기본 전체 선택: checkedIds가 null이면 종료되지 않은 항목 전체 선택
  const effectiveCheckedIds =
    checkedIds ??
    new Set(
      activeCartItems.filter((i) => i.status !== 'removed').map((i) => i.id),
    );

  // 선택된 항목 견적 합계 (live 단가, 종료 항목 제외) — 고객이 보는 금액
  const estimateSubtotal = activeCartItems
    .filter((i) => effectiveCheckedIds.has(i.id) && i.status !== 'removed')
    .reduce((sum, i) => sum + i.displayUnitPrice * i.quantity, 0);

  return (
    <section data-ga-section="contact-form">
      {/* 헤더 */}
      <div
        className="relative flex flex-col items-center justify-center gap-3 px-5 py-20 text-center"
        style={{
          backgroundImage: `url(${bannerImageUrl ?? '/images/contact-banner.png'})`,
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
              {/* Row 1: Name + Birthdate */}
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#2b2b2b]">
                    {t('formName')}
                    <span className="text-[#a83c44]"> *</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('formNamePlaceholder')}
                    className={cn(
                      'h-[44px] rounded-[6px] border bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]',
                      errBorder(nameInvalid),
                    )}
                  />
                  {t('formNameNote') && (
                    <p className="text-[11px] leading-relaxed whitespace-pre-line text-[#999]">
                      {t('formNameNote')}
                    </p>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#2b2b2b]">
                    {t('formBirthDate')}
                    <span className="text-[#a83c44]"> *</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={birthDate}
                    onChange={(e) =>
                      setBirthDate(formatBirthDate(e.target.value))
                    }
                    placeholder={t('formBirthDatePlaceholder')}
                    className={cn(
                      'h-[44px] rounded-[6px] border bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]',
                      errBorder(birthDateInvalid),
                    )}
                  />
                  {attemptedSubmit && birthDate && !birthDateValid && (
                    <p className="text-[11px] text-[#a83c44]">
                      {t('formBirthDateError')}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Phone + Email */}
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#2b2b2b]">
                    {t('formPhone')}
                    <span className="text-[#a83c44]"> *</span>
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
                      className={cn(
                        'h-[44px] flex-1 rounded-[6px] border bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]',
                        errBorder(phoneInvalid),
                      )}
                    />
                  </div>
                  {t('formPhoneNote') && (
                    <p className="text-[11px] leading-relaxed whitespace-pre-line text-[#999]">
                      {t('formPhoneNote')}
                    </p>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#2b2b2b]">
                    {t('formEmail')}
                    <span className="text-[#a83c44]"> *</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('formEmailPlaceholder')}
                    className={cn(
                      'h-[44px] rounded-[6px] border bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]',
                      errBorder(emailInvalid),
                    )}
                  />
                  {attemptedSubmit && email.trim() && !emailValid ? (
                    <p className="text-[11px] text-[#a83c44]">
                      {t('formEmailError')}
                    </p>
                  ) : (
                    t('formEmailNote') && (
                      <p className="text-[11px] leading-relaxed whitespace-pre-line text-[#999]">
                        {t('formEmailNote')}
                      </p>
                    )
                  )}
                </div>
              </div>

              {/* Row 2.5: Messenger (type dropdown + ID) — optional */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#2b2b2b]">
                  {t('formMessenger')}
                </label>
                <div className="flex gap-2">
                  <select
                    value={messengerType}
                    onChange={(e) => setMessengerType(e.target.value)}
                    className="h-[44px] w-[130px] shrink-0 rounded-[6px] border border-[#d9d9d9] bg-white px-2 text-[13px] text-[#2b2b2b]"
                  >
                    {MESSENGER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={messengerId}
                    onChange={(e) => setMessengerId(e.target.value)}
                    placeholder={t('formMessengerPlaceholder')}
                    className="h-[44px] flex-1 rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-2.5 text-[14px] placeholder:text-[#b3b3b3]"
                  />
                </div>
              </div>

              {/* 희망 예약 일시 — 메신저 바로 아래 */}
              {showDatetime && (
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#2b2b2b]">
                    {t('formPreferredDatetime')}
                    <span className="ml-1 text-[#a83c44]">*</span>
                  </label>
                  <div className="flex min-h-[44px] gap-5">
                    {/* 좌: 날짜 선택 */}
                    <div className="flex w-[180px] shrink-0 flex-col gap-1.5">
                      <div
                        className={cn(
                          'relative h-[44px] w-full rounded-[6px] border bg-white',
                          errBorder(!preferredDate),
                        )}
                      >
                        {/* 로케일별 포맷 표시 */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
                          <span className="text-[14px] text-[#2b2b2b]">
                            {preferredDate ? (
                              formatDateForLocale(preferredDate, locale)
                            ) : (
                              <span className="text-[#bbb]">
                                {DATE_PLACEHOLDER[locale] ??
                                  DATE_PLACEHOLDER.ko}
                              </span>
                            )}
                          </span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#999"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        {/* 실제 date input — 투명하게 올려서 picker 동작 */}
                        <input
                          type="date"
                          value={preferredDate}
                          min={getTodayStr()}
                          onClick={(e) => {
                            e.currentTarget.showPicker?.();
                          }}
                          onChange={(e) => {
                            setPreferredDate(e.target.value);
                            setPreferredTime('');
                            setBlockedSlots([]);
                          }}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </div>
                    </div>
                    {/* 우: 시간 슬롯 */}
                    <div className="flex flex-1 flex-wrap content-start gap-1.5">
                      {(() => {
                        if (!preferredDate) {
                          return null;
                        }
                        const slots = getTimeSlots(preferredDate, hours);
                        if (slots.length === 0) {
                          return (
                            <div className="flex h-[44px] items-center">
                              <p className="text-[13px] text-[#ccc]">
                                {t('clinicClosedOnDate')}
                              </p>
                            </div>
                          );
                        }
                        return slots.map((slot) => {
                          const available =
                            isSlotAvailable(preferredDate, slot) &&
                            !blockedSlots.includes(slot);
                          const selected = preferredTime === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={!available}
                              onClick={() =>
                                setPreferredTime(selected ? '' : slot)
                              }
                              data-ga-id={`contact-form.timeslot-${slot}`}
                              className={cn(
                                'h-[44px] rounded-[6px] border px-3 text-[13px] font-medium transition-colors',
                                selected
                                  ? 'border-transparent text-white'
                                  : available
                                    ? 'border-[#d9d9d9] bg-white text-[#2b2b2b] hover:border-[#a83c44] hover:text-[#a83c44]'
                                    : 'cursor-not-allowed border-[#eee] bg-white text-[#ccc]',
                              )}
                              style={
                                selected
                                  ? {
                                      backgroundColor: accentColor,
                                      borderColor: accentColor,
                                    }
                                  : undefined
                              }
                            >
                              {slot}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}

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
                          className={cn(
                            'flex items-center gap-3 border-b border-[#faf8f5] px-3.5 py-2.5',
                            item.status === 'removed' && 'opacity-60',
                          )}
                        >
                          {/* Checkbox — 판매종료 시 선택 불가 */}
                          {item.status === 'removed' ? (
                            <span
                              aria-hidden
                              className="flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border border-[#e0d8cd] bg-[#f3edea]"
                            />
                          ) : (
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
                          )}
                          {/* Name */}
                          <span className="flex-1 text-[13px] text-[#2b2b2b]">
                            {item.treatmentName}
                            <span className="ml-1.5 text-[11px] text-[#999]">
                              {item.displayLabel}
                            </span>
                            {item.status === 'removed' && (
                              <span className="ml-1.5 inline-flex items-center rounded-[3px] bg-[#9a9a9a] px-1 py-0.5 align-middle text-[10px] font-bold text-white">
                                {tc('discontinued')}
                              </span>
                            )}
                          </span>
                          {/* Price (live) */}
                          {item.status !== 'removed' && (
                            <span className="shrink-0 text-[12px] font-semibold text-[#2b2b2b]">
                              ₩
                              {(
                                item.displayUnitPrice * item.quantity
                              ).toLocaleString('ko-KR')}
                            </span>
                          )}
                          {/* 판매종료: 제거 버튼만 / 그 외: 수량 스테퍼 */}
                          {item.status === 'removed' ? (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              data-ga-id={`contact-form.remove-${item.id}`}
                              aria-label={tc('removeItem')}
                              className="flex size-6 items-center justify-center rounded-full text-[13px] text-[#999] transition-colors hover:bg-[#f3edea] hover:text-[#2b2b2b]"
                            >
                              ✕
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  item.quantity <= 1
                                    ? removeItem(item.id)
                                    : updateQuantity(item.id, item.quantity - 1)
                                }
                                data-ga-id={`contact-form.qty-minus-${item.id}`}
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
                                data-ga-id={`contact-form.qty-plus-${item.id}`}
                                className="flex size-6 items-center justify-center rounded-full bg-[#f3edea] text-[12px] text-[#2b2b2b]"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3.5 py-4 text-center text-[13px] text-[#999]">
                      {t('emptyCartNote')}
                    </div>
                  )}
                  {estimateSubtotal > 0 && (
                    <div className="flex items-center justify-between border-t border-[#efe5d9] bg-[#faf8f5] px-3.5 py-2.5">
                      <span className="text-[12px] font-medium text-[#666]">
                        {tc('estimateSubtotal')}
                      </span>
                      <span className="text-[14px] font-bold text-[#a83c44]">
                        ₩{estimateSubtotal.toLocaleString('ko-KR')}
                      </span>
                    </div>
                  )}
                  <Link
                    href={`/${locale}/treatments`}
                    data-ga-id="contact-form.explore-treatments"
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

              {/* Row 4: Message */}
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

              {/* 개인정보 수집 및 이용 동의 */}
              <div className="flex flex-col gap-1.5">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <span
                    className={cn(
                      'flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors',
                      privacyConsent
                        ? 'border-transparent'
                        : privacyError
                          ? 'border-[#a83c44] bg-white'
                          : 'border-[#d5cabe] bg-white',
                    )}
                    style={
                      privacyConsent
                        ? {
                            backgroundColor: accentColor,
                            borderColor: accentColor,
                          }
                        : undefined
                    }
                  >
                    {privacyConsent && (
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
                    checked={privacyConsent}
                    onChange={(e) => {
                      setPrivacyConsent(e.target.checked);
                      if (e.target.checked) setPrivacyError(false);
                    }}
                    className="sr-only"
                  />
                  <span className="text-[13px] text-[#2b2b2b]">
                    {t('privacyAgreePre')}
                    <Link
                      href={`/${locale}/privacy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ga-id="contact-form.privacy"
                      className="underline underline-offset-2 hover:text-[#a83c44]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('privacyTitle')}
                    </Link>
                    {t('privacyAgreePost')}{' '}
                    <span className="font-medium text-[#a83c44]">
                      {t('privacyRequired')}
                    </span>
                  </span>
                </label>
                {privacyError && (
                  <p className="ml-[30px] text-[12px] text-[#a83c44]">
                    {t('privacyError')}
                  </p>
                )}
              </div>

              {isSuccess && (
                <div className="rounded-[6px] bg-[#e8f5e9] px-4 py-3 text-center text-[14px] text-[#2e7d32]">
                  {t('submitSuccess')}
                </div>
              )}

              {attemptedSubmit &&
                (nameInvalid ||
                  phoneInvalid ||
                  emailInvalid ||
                  birthDateInvalid) && (
                  <p className="text-center text-[12px] text-[#a83c44]">
                    {t('formRequiredError')}
                  </p>
                )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  data-ga-id="contact-form.submit"
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
