import { Fragment } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Pagination } from '@/components/common/Pagination';
import { BACard, type BACase } from './BACard';
import { cn } from '@/lib/utils/cn';

const FILTER_TABS = [
  { id: 'all', key: 'filterAll' },
  { id: 'lifting', key: 'filterLifting' },
  { id: 'skincare', key: 'filterSkincare' },
  { id: 'toning', key: 'filterToning' },
  { id: 'botox-filler', key: 'filterBotox' },
] as const;

interface BAGridProps {
  cases: BACase[];
  locale: string;
  currentPage?: number;
  totalPages?: number;
  activeCategory?: string;
}

function getFilterUrl(locale: string, cat: string): string {
  if (cat === 'all') return `/${locale}/before-after`;
  return `/${locale}/before-after?cat=${cat}`;
}

function getPaginationBasePath(locale: string, cat: string): string {
  if (cat === 'all') return `/${locale}/before-after`;
  return `/${locale}/before-after?cat=${cat}`;
}

async function BAGrid({
  cases,
  locale,
  currentPage = 1,
  totalPages = 1,
  activeCategory = 'all',
}: BAGridProps) {
  const t = await getTranslations('ba');

  const activeTab =
    FILTER_TABS.find((tab) => tab.id === activeCategory) ?? FILTER_TABS[0];

  return (
    <div>
      {/* 탭 바 — sticky */}
      <nav
        role="tablist"
        aria-label={t('title')}
        className="sticky top-16 z-20 border-b-2 border-[#e8ded6] bg-white"
      >
        <div className="flex w-full flex-wrap items-center justify-center gap-y-1 px-4 py-2">
          {FILTER_TABS.map((tab, idx) => {
            const isActive = tab.id === activeCategory;
            const isAllTab = tab.id === 'all';
            const nextTab = FILTER_TABS[idx + 1];
            return (
              <Fragment key={tab.id}>
                <Link
                  href={getFilterUrl(locale, tab.id)}
                  scroll={false}
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    'rounded px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 md:px-5 md:text-[14px]',
                    isActive
                      ? 'bg-[#a83c44]/10 font-semibold text-[#a83c44]'
                      : 'text-neutral-500 hover:text-[#2b2b2b]',
                  )}
                >
                  {t(tab.key)}
                </Link>
                {isAllTab && nextTab && (
                  <div className="mx-1 h-5 w-px shrink-0 bg-[#d9cfc5]" />
                )}
              </Fragment>
            );
          })}
        </div>
      </nav>

      {/* 섹션 헤더 */}
      <div className="border-b border-[#e8ded6] bg-[#faf8f5] px-5 py-8 md:px-10 lg:px-12">
        <div className="mx-auto max-w-[var(--container-max)]">
          <p className="text-[12px] font-medium tracking-widest text-[#a83c44] uppercase">
            BEFORE &amp; AFTER
          </p>
          <h2 className="mt-1 text-[22px] font-bold text-[#2b2b2b] md:text-[26px]">
            {t(activeTab.key)}
          </h2>
          <p className="mt-2 text-[14px] leading-[1.6] text-[#706263]">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="bg-white px-5 py-10 md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1272px]">
          <div
            className="grid justify-center gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}
          >
            {cases.map((baCase) => (
              <BACard key={baCase.id} baCase={baCase} locale={locale} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={getPaginationBasePath(locale, activeCategory)}
            className="mt-12"
          />
        </div>
      </div>
    </div>
  );
}

export { BAGrid, type BAGridProps };
