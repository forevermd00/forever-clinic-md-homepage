import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';

interface CategorySectionProps {
  labelEn: string;
  label: string;
  description: string;
  href: string;
  ctaText: string;
  bgColor: string;
  imagePosition: 'left' | 'right';
  isEvent?: boolean;
  imageSrc?: string;
  className?: string;
}

function CategorySection({
  labelEn,
  label,
  description,
  href,
  ctaText,
  bgColor,
  imagePosition,
  isEvent,
  imageSrc,
  className,
}: CategorySectionProps) {
  const textContent = (
    <div className="flex flex-1 flex-col justify-center">
      <span className="text-[12px] font-medium tracking-[2px] text-[#706263] uppercase">
        {labelEn}
      </span>
      <div className="mt-3 flex items-center gap-3">
        <h3 className="text-[20px] font-bold text-[#2b2b2b] lg:text-[28px]">
          {label}
        </h3>
        {isEvent && (
          <span className="rounded-[4px] bg-[#a83d45] px-2 py-0.5 text-[11px] font-bold text-white">
            EVENT
          </span>
        )}
      </div>
      <p className="mt-3 text-[14px] leading-[1.7] text-[#666]">
        {description}
      </p>
      <Link
        href={href}
        data-ga-id={`treatment-category-cta-${labelEn.toLowerCase().replace(/\s+/g, '-')}`}
        className="mt-5 inline-flex text-[14px] font-bold text-[#a83c44] transition-colors hover:text-[#8c2e38]"
      >
        {ctaText} →
      </Link>
    </div>
  );

  const imageContent = imageSrc ? (
    <img
      src={imageSrc}
      alt={label}
      className="h-[220px] w-full rounded-[8px] object-cover lg:h-[400px] lg:w-[620px] lg:shrink-0"
    />
  ) : (
    <ImagePlaceholder
      label={label}
      variant="warm"
      className="h-[220px] w-full rounded-[8px] lg:h-[400px] lg:w-[620px] lg:shrink-0"
    />
  );

  return (
    <section
      className={cn(
        bgColor,
        isEvent && 'border-l-[3px] border-[#a83d45]',
        'px-5 py-10 md:px-10 lg:px-[120px] lg:py-[60px]',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-[60px]">
        {imagePosition === 'left' ? (
          <>
            {imageContent}
            {textContent}
          </>
        ) : (
          <>
            <div className="order-2 lg:order-1">{textContent}</div>
            <div className="order-1 lg:order-2">{imageContent}</div>
          </>
        )}
      </div>
    </section>
  );
}

export { CategorySection, type CategorySectionProps };
