'use client';

import { cn } from '@/lib/utils/cn';

type FilterTabVariant = 'underline' | 'pill' | 'anchor';

interface Tab {
  id: string;
  label: string;
}

interface FilterTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  variant?: FilterTabVariant;
  className?: string;
}

function FilterTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'pill',
  className,
}: FilterTabsProps) {
  if (variant === 'anchor') {
    return (
      <nav
        role="tablist"
        className={cn(
          'sticky top-16 z-20 flex justify-center overflow-x-auto bg-white shadow-[var(--shadow-1)]',
          'gap-2 px-4 sm:gap-6 md:gap-8 md:px-6 lg:gap-10 lg:px-12',
          className,
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'shrink-0 px-2 py-3 text-[15px] font-medium whitespace-nowrap transition-colors duration-200 sm:px-4',
                isActive
                  ? 'border-forever-red text-forever-charcoal border-b-2'
                  : 'hover:text-forever-charcoal text-neutral-500',
              )}
              data-ga-id={`ui-filter-tabs.tab-${tab.id}`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    );
  }

  if (variant === 'underline') {
    return (
      <div role="tablist" className={cn('flex gap-6', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'pb-2 text-[15px] font-medium transition-colors duration-200',
                isActive
                  ? 'border-forever-red text-forever-charcoal border-b-2'
                  : 'hover:text-forever-charcoal text-neutral-500',
              )}
              data-ga-id={`ui-filter-tabs.tab-${tab.id}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  // pill (default)
  return (
    <div role="tablist" className={cn('flex flex-wrap gap-2', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors duration-200',
              isActive
                ? 'bg-forever-red text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100',
            )}
            data-ga-id={`ui-filter-tabs.tab-${tab.id}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export { FilterTabs, type FilterTabsProps, type FilterTabVariant, type Tab };
