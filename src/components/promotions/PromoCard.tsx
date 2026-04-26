import { cn } from '@/lib/utils/cn';

interface PromoCardProps {
  image?: { src: string; alt: string };
  badge?: string;
  title: string;
  description: string;
  date: string;
  originalPrice?: string;
  discountedPrice?: string;
  className?: string;
}

function PromoCard({
  image,
  badge,
  title,
  description,
  date,
  originalPrice,
  discountedPrice,
  className,
}: PromoCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[8px] bg-white shadow-[0px_2px_2px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      {/* Image */}
      <div className="relative h-[198px] overflow-hidden">
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="bg-forever-beige h-full w-full" />
        )}
        {badge && (
          <span className="absolute top-3 left-3 rounded-[4px] bg-[#a83c44] px-2 py-1 text-[11px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-2 pb-4">
        <h3 className="text-[15px] font-bold text-[#2b2b2b]">{title}</h3>
        <p className="mt-1 text-[12px] text-[#706263]">{description}</p>
        <p className="mt-1 text-[11px] text-[#999]">{date}</p>
        {(originalPrice || discountedPrice) && (
          <div className="mt-2 flex items-center gap-2">
            {originalPrice && (
              <span className="text-[13px] text-[#999] line-through">
                {originalPrice}
              </span>
            )}
            {discountedPrice && (
              <span className="text-[14px] font-bold text-[#a83c44]">
                {discountedPrice}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { PromoCard, type PromoCardProps };
