'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const MEDIA_TABS = [
  { label: '보도자료', path: 'press' },
  { label: '영상', path: 'video' },
  { label: '블로그', path: 'blog' },
  { label: '공지사항', path: 'notice' },
] as const;

export function MediaSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-16 z-20 border-b border-[#e8ded6] bg-white/92 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[var(--container-max)] justify-center gap-2 overflow-x-auto px-4 sm:gap-6 md:gap-8 md:px-6 lg:gap-10 lg:px-12">
        {MEDIA_TABS.map((tab) => {
          const isActive = pathname.includes(`/media/${tab.path}`);
          return (
            <Link
              key={tab.path}
              href={`/${pathname.split('/')[1]}/media/${tab.path}`}
              className={cn(
                'shrink-0 px-2 py-3 text-[14px] font-medium whitespace-nowrap transition-colors duration-200 sm:px-4',
                isActive
                  ? 'border-b-2 border-[#a83d45] font-bold text-[#a83d45]'
                  : 'text-[#706163] hover:text-[#2b2b2b]',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
