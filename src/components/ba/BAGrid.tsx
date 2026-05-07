import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Pagination } from '@/components/common/Pagination';
import { BACard, type BACase } from './BACard';
import { cn } from '@/lib/utils/cn';

const FILTER_TAB_KEYS = [
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
  totalPages = 3,
  activeCategory = 'all',
}: BAGridProps) {
  const t = await getTranslations('ba');

  const filtered =
    activeCategory === 'all'
      ? cases
      : cases.filter((c) => c.category === activeCategory);

  return (
    <section className="bg-white px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[var(--container-max)]">
        {/* Section title */}
        <h2 className="text-forever-charcoal mb-8 text-center text-[28px] font-bold">
          {t('title')}
        </h2>

        {/* Filter pills - URL-based navigation */}
        <div className="mb-8 flex justify-center">
          <div role="tablist" className="flex flex-wrap justify-center gap-2">
            {FILTER_TAB_KEYS.map((tab) => {
              const isActive = tab.id === activeCategory;
              return (
                <Link
                  key={tab.id}
                  href={getFilterUrl(locale, tab.id)}
                  scroll={true}
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    'rounded-[20px] px-4 py-2 text-[13px] font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-[#2b2b2b] text-white'
                      : 'border border-[#efe5d9] bg-white text-neutral-600 hover:bg-neutral-50',
                  )}
                >
                  {t(tab.key)}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Card grid — 고정 너비 카드, vw에 따라 열 수 자동 조정 (최대 4열) */}
        <div className="mx-auto max-w-[1272px]">
          <div
            className="grid justify-center gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}
          >
            {filtered.map((baCase) => (
              <BACard key={baCase.id} baCase={baCase} locale={locale} />
            ))}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={getPaginationBasePath(locale, activeCategory)}
          className="mt-12"
        />
      </div>
    </section>
  );
}

export { BAGrid, type BAGridProps };
