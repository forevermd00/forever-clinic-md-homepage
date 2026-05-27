import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { BALockOverlay } from './BALockOverlay';

export interface BACase {
  id: string;
  title: string;
  sessions?: string;
  category: string;
  beforeImage?: string;
  afterImage?: string;
}

interface BACardProps {
  baCase: BACase;
  locale: string;
  className?: string;
}

function BACard({ baCase, locale, className }: BACardProps) {
  const displayTitle = [baCase.title, baCase.sessions]
    .filter(Boolean)
    .join(' — ');

  return (
    <Link
      href={`/${locale}/before-after/${baCase.id}`}
      className={cn(
        'block w-[300px] overflow-hidden rounded-[8px] border border-[#efe5d9] shadow-[0px_1px_2px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex h-[250px]">
        <div className="flex-1 overflow-hidden">
          <BALockOverlay locale={locale} className="h-[250px] w-full">
            <div className="h-[250px] w-full bg-[#f3eee6]" />
          </BALockOverlay>
        </div>
        <div className="flex-1 bg-[#e0d2b6]" />
      </div>

      {displayTitle && (
        <div className="px-3 py-3">
          <p className="text-[15px] leading-snug font-bold text-[#2b2b2b]">
            {displayTitle}
          </p>
        </div>
      )}
    </Link>
  );
}

export { BACard, type BACardProps };
