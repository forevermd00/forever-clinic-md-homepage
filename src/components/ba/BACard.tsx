import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils/cn';
import { BALockOverlay } from './BALockOverlay';

export interface BACase {
  id: string;
  treatmentName: string;
  sessionCount: number;
  category: string;
  beforeImage?: string;
  afterImage?: string;
}

interface BACardProps {
  baCase: BACase;
  locale: string;
  className?: string;
}

async function BACard({ baCase, locale, className }: BACardProps) {
  const t = await getTranslations('ba');

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

      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-forever-charcoal text-[15px] font-bold">
          {baCase.treatmentName}
        </span>
        <span className="text-[13px] text-[#706263]">
          {t('sessions', { count: baCase.sessionCount })}
        </span>
      </div>
    </Link>
  );
}

export { BACard, type BACardProps };
