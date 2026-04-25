import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ColumnConfig {
  mobile?: 1 | 2 | 3 | 4 | 5 | 6;
  tablet?: 1 | 2 | 3 | 4 | 5 | 6;
  desktop?: 1 | 2 | 3 | 4 | 5 | 6;
}

type GapSize = 'sm' | 'md' | 'lg';

interface CardGridProps {
  columns?: ColumnConfig;
  gap?: GapSize;
  children: ReactNode;
  className?: string;
}

const gapStyles: Record<GapSize, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

const mobileColStyles: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const tabletColStyles: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};

const desktopColStyles: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

function CardGrid({
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  children,
  className,
}: CardGridProps) {
  const { mobile = 1, tablet = 2, desktop = 3 } = columns;

  return (
    <div
      className={cn(
        'mx-auto grid w-full max-w-[var(--container-max)]',
        mobileColStyles[mobile],
        tabletColStyles[tablet],
        desktopColStyles[desktop],
        gapStyles[gap],
        className,
      )}
    >
      {children}
    </div>
  );
}

export { CardGrid, type CardGridProps, type ColumnConfig, type GapSize };
