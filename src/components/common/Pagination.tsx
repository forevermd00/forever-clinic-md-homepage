'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  className?: string;
}

function getPageUrl(basePath: string, page: number): string {
  if (page === 1) return basePath;
  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}page=${page}`;
}

function getVisiblePages(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);
  return pages;
}

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Pagination({
  currentPage,
  totalPages,
  basePath,
  className,
}: PaginationProps) {
  const pages = getVisiblePages(currentPage, totalPages);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {/* Previous */}
      {isFirst ? (
        <span
          aria-disabled="true"
          className="inline-flex h-10 min-w-10 items-center justify-center text-neutral-400"
        >
          <ChevronLeft />
        </span>
      ) : (
        <Link
          href={getPageUrl(basePath, currentPage - 1)}
          aria-label="Previous page"
          className="hover:text-forever-charcoal inline-flex h-10 min-w-10 items-center justify-center text-neutral-400 transition-colors"
          data-ga-id="pagination-prev"
        >
          <ChevronLeft />
        </Link>
      )}

      {/* Page numbers */}
      {pages.map((page, idx) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex h-10 min-w-10 items-center justify-center text-neutral-400"
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return isActive ? (
          <span
            key={page}
            aria-current="page"
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-[4px] bg-[#2b2b2b] text-sm font-medium text-white"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={getPageUrl(basePath, page)}
            className="hover:text-forever-charcoal inline-flex h-10 min-w-10 items-center justify-center rounded-[4px] text-sm text-neutral-600 transition-colors"
            data-ga-id={`pagination-${page}`}
          >
            {page}
          </Link>
        );
      })}

      {/* Next */}
      {isLast ? (
        <span
          aria-disabled="true"
          className="inline-flex h-10 min-w-10 items-center justify-center text-neutral-400"
        >
          <ChevronRight />
        </span>
      ) : (
        <Link
          href={getPageUrl(basePath, currentPage + 1)}
          aria-label="Next page"
          className="hover:text-forever-charcoal inline-flex h-10 min-w-10 items-center justify-center text-neutral-400 transition-colors"
          data-ga-id="pagination-next"
        >
          <ChevronRight />
        </Link>
      )}
    </nav>
  );
}

export { Pagination, type PaginationProps };
