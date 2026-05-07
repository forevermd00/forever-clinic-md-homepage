import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface TreatmentCardProps {
  name: string;
  slug: string;
  category: string;
  categoryLabel: string;
  price: string;
  imageSrc?: string;
  hasEvent?: boolean;
  locale: string;
  className?: string;
}

function TreatmentCard({
  name,
  slug,
  category,
  categoryLabel,
  price,
  imageSrc,
  hasEvent,
  locale,
  className,
}: TreatmentCardProps) {
  return (
    <Link
      href={`/${locale}/treatments/${category}/${slug}`}
      className={cn(
        'group block w-[300px] overflow-hidden rounded-[8px] border border-[#efe5d9] bg-white shadow-[0px_2px_2px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0px_4px_8px_rgba(0,0,0,0.12)]',
        className,
      )}
    >
      {/* Image */}
      <div className="bg-forever-beige relative h-[220px] overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <span className="text-sm">No Image</span>
          </div>
        )}
        {hasEvent && (
          <span className="absolute top-3 left-3 rounded-[4px] bg-[#a83d45] px-2 py-1 text-[11px] font-bold text-white">
            EVENT
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-2.5 pb-3.5">
        <span className="inline-block rounded-[4px] bg-[#faf8f5] px-1.5 py-0.5 text-[11px] font-medium text-[#a83c44]">
          {categoryLabel}
        </span>
        <h3 className="mt-1.5 text-[16px] font-bold text-[#2b2b2b]">{name}</h3>
        <p className="mt-1 text-[14px] font-medium text-[#a83c44]">{price}</p>
      </div>
    </Link>
  );
}

export { TreatmentCard, type TreatmentCardProps };
