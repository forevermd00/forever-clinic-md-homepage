import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface TreatmentCardProps {
  name: string;
  slug: string;
  category: string;
  categoryLabel: string;
  price: string;
  hasEvent?: boolean;
  locale: string;
  dark?: boolean;
  className?: string;
  showDetail?: boolean;
}

function TreatmentCard({
  name,
  slug,
  category,
  categoryLabel,
  price,
  hasEvent,
  locale,
  dark,
  className,
  showDetail = true,
}: TreatmentCardProps) {
  const cardClass = cn(
    'group block w-[300px] overflow-hidden rounded-[8px]',
    showDetail
      ? dark
        ? 'border border-white/10 bg-white/5 transition-all hover:border-white/30 hover:bg-white/10'
        : 'border border-[#efe5d9] bg-white shadow-[0px_2px_2px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0px_4px_8px_rgba(0,0,0,0.12)]'
      : dark
        ? 'border border-white/10 bg-white/5'
        : 'border border-[#efe5d9] bg-white shadow-[0px_2px_2px_rgba(0,0,0,0.08)]',
    className,
  );

  const inner = (
    <div className="px-4 pt-4 pb-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-block rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium text-[#a83c44]',
            dark ? 'bg-white/10' : 'bg-[#faf8f5]',
          )}
        >
          {categoryLabel}
        </span>
        {hasEvent && (
          <span className="rounded-[4px] bg-[#a83d45] px-2 py-0.5 text-[11px] font-bold text-white">
            EVENT
          </span>
        )}
      </div>
      <h3
        className={cn(
          'mt-2 text-[16px] font-bold',
          dark ? 'text-white' : 'text-[#2b2b2b]',
        )}
      >
        {name}
      </h3>
      <p className="mt-1 text-[14px] font-medium text-[#a83c44]">{price}</p>
    </div>
  );

  if (!showDetail) {
    return <div className={cardClass}>{inner}</div>;
  }

  return (
    <Link
      href={`/${locale}/treatments/${category}/${slug}`}
      className={cardClass}
    >
      {inner}
    </Link>
  );
}

export { TreatmentCard, type TreatmentCardProps };
