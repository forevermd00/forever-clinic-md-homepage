'use client';

import { useMemo, Fragment } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { TREATMENT_CATEGORIES, type TreatmentCategory } from './treatmentData';
import { TreatmentCard } from './TreatmentCard';

/* ----------------------------------------------------------------
   시술 탭 그리드
   - 이벤트 탭 (맨 앞) + 6개 카테고리 탭 (URL 파라미터 ?cat= 연동)
   - 탭 라벨: footer / treatments 번역키 사용 (4개 언어 지원)
   - 탭 가운데 정렬, 언어별 폰트 적용
   ---------------------------------------------------------------- */

const EVENT_SLUG = 'event';
const SIGNATURE_SLUG = 'signature';

const CATEGORY_FOOTER_KEYS: Record<string, string> = {
  'lifting-laser': 'liftingLaser',
  'petit-lifting': 'petitLifting',
  skincare: 'skincareCat',
  'skin-booster': 'skinBooster',
  'hair-removal': 'hairRemoval',
  anesthesia: 'anesthesia',
};

const LOCALE_FONTS: Record<string, string> = {
  ko: 'sandoll-myeongjoneo1, serif',
  en: 'minion-3, serif',
  zh: 'tt-songti-chs-variable, serif',
  ja: 'kozuka-mincho-pro-b, serif',
};

interface TreatmentsTabGridProps {
  locale: string;
  categories?: TreatmentCategory[];
}

export function TreatmentsTabGrid({
  locale,
  categories = TREATMENT_CATEGORIES,
}: TreatmentsTabGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('treatments');
  const tc = useTranslations('common');
  const tFooter = useTranslations('footer');

  const fontFamily = LOCALE_FONTS[locale] ?? LOCALE_FONTS.ko;

  // 이벤트 가상 카테고리 — hasEvent: true인 시술 전체 수집
  const eventCategory = useMemo<TreatmentCategory>(
    () => ({
      slug: EVENT_SLUG,
      label: t('eventLabel'),
      labelEn: 'EVENTS',
      description: t('eventDescription'),
      bgColor: 'bg-white',
      treatments: categories
        .flatMap((cat) => cat.treatments)
        .filter((treatment) => treatment.hasEvent),
    }),
    [categories, t],
  );

  // 시그니처 카테고리 분리 (일반 카테고리에서 제외)
  const signatureCategory = useMemo(
    () => categories.find((c) => c.slug === SIGNATURE_SLUG),
    [categories],
  );
  const regularCategories = useMemo(
    () => categories.filter((c) => c.slug !== SIGNATURE_SLUG),
    [categories],
  );

  // 특수 탭(이벤트 + 시그니처) + 일반 카테고리 탭 목록
  const allTabs = useMemo(
    () => [
      eventCategory,
      ...(signatureCategory ? [signatureCategory] : []),
      ...regularCategories,
    ],
    [eventCategory, signatureCategory, regularCategories],
  );

  // ?slugs= 파라미터: 고민/상황 탭에서 넘어온 필터된 시술 목록
  const slugsParam = searchParams.get('slugs');
  const slugFilter = useMemo(
    () =>
      slugsParam
        ? slugsParam
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : null,
    [slugsParam],
  );
  const labelParam = searchParams.get('label') ?? '';
  const descParam = searchParams.get('desc') ?? '';

  // slug 필터가 있을 때 가상 카테고리 생성
  const filteredCategory = useMemo<TreatmentCategory | null>(() => {
    if (!slugFilter) return null;
    const allTreatments = categories.flatMap((c) => c.treatments);
    // slugs 순서 유지
    const matched = slugFilter
      .map((s) => allTreatments.find((t) => t.slug === s))
      .filter((t): t is NonNullable<typeof t> => t !== undefined);
    return {
      slug: '__filtered__',
      label: labelParam || '추천 시술',
      labelEn: 'RECOMMENDED',
      description: descParam,
      bgColor: 'bg-white',
      treatments: matched,
    };
  }, [slugFilter, labelParam, descParam, categories]);

  // searchParams에서 직접 파생 — useEffect + setState 패턴 제거
  const activeCategory = filteredCategory
    ? '__filtered__'
    : (() => {
        const cat = searchParams.get('cat');
        return cat && allTabs.find((c) => c.slug === cat) ? cat : EVENT_SLUG;
      })();

  const handleTabChange = (slug: string) => {
    const params = new URLSearchParams();
    params.set('cat', slug);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentCategory =
    filteredCategory && activeCategory === '__filtered__'
      ? filteredCategory
      : (allTabs.find((c) => c.slug === activeCategory) ?? allTabs[0]);

  return (
    <div>
      {/* 탭 바 — sticky, border 명확 */}
      <nav
        role="tablist"
        aria-label={t('title')}
        className="scrollbar-hide sticky top-16 z-20 flex overflow-x-auto border-b-2 border-[#e8ded6] bg-white"
      >
        <div className="mx-auto flex w-full max-w-[var(--container-max)] items-center justify-center px-5 md:px-10 lg:px-12">
          {allTabs.map((cat, idx) => {
            const isActive = cat.slug === activeCategory;
            const isEventTab = cat.slug === EVENT_SLUG;
            const isSignatureTab = cat.slug === SIGNATURE_SLUG;
            const isSpecialTab = isEventTab || isSignatureTab;
            // 일반 카테고리의 첫 번째 탭 앞에 구분선 (이전 탭이 특수 탭일 때)
            const prevTab = allTabs[idx - 1];
            const isFirstRegular =
              !isSpecialTab &&
              (prevTab?.slug === EVENT_SLUG ||
                prevTab?.slug === SIGNATURE_SLUG);

            const labelKey = CATEGORY_FOOTER_KEYS[cat.slug];
            const label = isEventTab
              ? t('eventLabel')
              : isSignatureTab
                ? cat.label
                : labelKey
                  ? tFooter(labelKey)
                  : cat.label;

            if (isSpecialTab) {
              const isSignature = isSignatureTab;
              return (
                <button
                  key={cat.slug}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${cat.slug}`}
                  onClick={() => handleTabChange(cat.slug)}
                  style={{ fontFamily }}
                  className={cn(
                    'mr-1.5 flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all duration-200 md:text-[14px]',
                    isSignature
                      ? isActive
                        ? 'bg-[#2b2b2b] text-white shadow-sm'
                        : 'border border-[#2b2b2b] text-[#2b2b2b] hover:bg-[#2b2b2b]/5'
                      : isActive
                        ? 'bg-[#a83c44] text-white shadow-sm'
                        : 'border border-[#a83c44] text-[#a83c44] hover:bg-[#a83c44]/5',
                  )}
                >
                  {isEventTab && (
                    <svg
                      width="12"
                      height="13"
                      viewBox="0 0 12 13"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M6.5 0.5C6.5 0.5 7 3 5.5 4.5C4 6 3 5.5 3 5.5C3 5.5 3.5 7.5 5 8.5C6.5 9.5 7 9 7 9C7 9 6.5 10.5 5 11.5C5 11.5 8 11.5 9.5 9C11 6.5 9.5 4 8.5 3C7.5 2 6.5 0.5 6.5 0.5Z" />
                      <path d="M5 8.5C5 8.5 4 9.5 4 10.5C4 11.5 4.8 12.5 6 12.5C7.2 12.5 8 11.5 8 10.5C8 9.5 7 8.5 7 8.5C7 8.5 6.5 9.5 6 9.5C5.5 9.5 5 8.5 5 8.5Z" />
                    </svg>
                  )}
                  {isSignatureTab && (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M5.5 0L6.8 3.9H11L7.6 6.3L8.9 10.2L5.5 7.8L2.1 10.2L3.4 6.3L0 3.9H4.2L5.5 0Z" />
                    </svg>
                  )}
                  {label}
                </button>
              );
            }

            return (
              <Fragment key={cat.slug}>
                {/* 특수 탭과 일반 카테고리 사이 구분선 */}
                {isFirstRegular && (
                  <div className="mx-2 h-5 w-px shrink-0 bg-[#d9cfc5]" />
                )}
                <button
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${cat.slug}`}
                  onClick={() => handleTabChange(cat.slug)}
                  style={{ fontFamily }}
                  className={cn(
                    'shrink-0 border-b-2 px-4 py-4 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 md:px-5 md:text-[14px]',
                    isActive
                      ? 'border-[#a83c44] text-[#a83c44]'
                      : 'border-transparent text-neutral-500 hover:text-[#2b2b2b]',
                  )}
                >
                  {label}
                </button>
              </Fragment>
            );
          })}
        </div>
      </nav>

      {/* 탭 패널 */}
      {currentCategory && (
        <div
          id={`panel-${currentCategory.slug}`}
          role="tabpanel"
          aria-label={currentCategory.label}
        >
          {/* 시그니처 탭 — 다크 테마 유지, 카드만 통일 */}
          {currentCategory.slug === SIGNATURE_SLUG ? (
            <div className="bg-[#1a1a1a]">
              <div className="border-b border-white/10 px-5 py-10 md:px-10 lg:px-12">
                <div className="mx-auto max-w-[var(--container-max)]">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a83c44] uppercase">
                    SIGNATURE PROGRAMS
                  </p>
                  <h2 className="mt-1 text-[22px] font-bold text-white md:text-[26px]">
                    {currentCategory.label}
                  </h2>
                  {currentCategory.description && (
                    <p className="mt-2 text-[14px] leading-[1.6] text-white/50">
                      {currentCategory.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="px-5 py-10 md:px-10 lg:px-12">
                <div className="mx-auto max-w-[1272px]">
                  <div
                    className="grid justify-center gap-4"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}
                  >
                    {currentCategory.treatments.map((treatment) => (
                      <TreatmentCard
                        key={treatment.slug || treatment.name}
                        name={treatment.name}
                        slug={treatment.slug}
                        category={SIGNATURE_SLUG}
                        categoryLabel={currentCategory.label}
                        price={treatment.price}
                        hasEvent={treatment.hasEvent}
                        locale={locale}
                        dark
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 일반 카테고리 설명 헤더 */}
              <div className="border-b border-[#e8ded6] bg-[#faf8f5] px-5 py-8 md:px-10 lg:px-12">
                <div className="mx-auto max-w-[var(--container-max)]">
                  <p className="text-[12px] font-medium tracking-widest text-[#a83c44] uppercase">
                    {currentCategory.slug === '__filtered__'
                      ? 'RECOMMENDED'
                      : currentCategory.slug === EVENT_SLUG
                        ? 'SPECIAL OFFER'
                        : currentCategory.labelEn}
                  </p>
                  <h2 className="mt-1 text-[22px] font-bold text-[#2b2b2b] md:text-[26px]">
                    {currentCategory.label}
                  </h2>
                  {currentCategory.description && (
                    <p className="mt-2 text-[14px] leading-[1.6] text-[#706263]">
                      {currentCategory.description}
                    </p>
                  )}
                </div>
              </div>

              {/* 시술 그리드 */}
              <div className="bg-white px-5 py-10 md:px-10 lg:px-12">
                <div className="mx-auto max-w-[1272px]">
                  <div
                    className="grid justify-center gap-4"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}
                  >
                    {currentCategory.treatments.map((treatment) => {
                      const isCrossCategory =
                        currentCategory.slug === EVENT_SLUG ||
                        currentCategory.slug === '__filtered__';
                      const cardCategory = isCrossCategory
                        ? treatment.category
                        : currentCategory.slug;
                      const cardCategoryLabel = isCrossCategory
                        ? (categories.find((c) => c.slug === treatment.category)
                            ?.label ?? currentCategory.label)
                        : currentCategory.label;
                      return (
                        <TreatmentCard
                          key={treatment.slug || treatment.name}
                          name={treatment.name}
                          slug={treatment.slug}
                          category={cardCategory}
                          categoryLabel={cardCategoryLabel}
                          price={treatment.price}
                          hasEvent={treatment.hasEvent}
                          locale={locale}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 하단 상담 CTA */}
      <section className="bg-[#5c1f24] py-12 text-center">
        <h2 className="text-[22px] font-bold text-white lg:text-[26px]">
          {tc('startConsultation')}
        </h2>
        <p className="mt-2 text-[13px] text-[rgba(255,255,255,0.6)]">
          {tc('findRightTreatment')}
        </p>
        <Link
          href={`/${locale}/contact`}
          className="mt-6 inline-flex items-center justify-center rounded-[4px] border border-white px-8 py-3 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
        >
          {tc('consultationReservation')}
        </Link>
      </section>
    </div>
  );
}
