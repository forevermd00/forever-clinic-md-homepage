import { cn } from '@/lib/utils/cn';

type CTAVariant = 'default' | 'highlight';

interface CTABannerProps {
  variant?: CTAVariant;
  title: string;
  description?: string;
  ctaText: string;
  ctaHref: string;
  className?: string;
}

function CTABanner({
  variant = 'default',
  title,
  description,
  ctaText,
  ctaHref,
  className,
}: CTABannerProps) {
  const isHighlight = variant === 'highlight';

  return (
    <section
      className={cn(
        'px-6 py-16 text-center',
        isHighlight
          ? 'bg-forever-charcoal text-white'
          : 'bg-forever-beige text-forever-charcoal',
        className,
      )}
    >
      <h2 className="text-[28px] font-bold">{title}</h2>
      {description && <p className="mt-3 text-base">{description}</p>}
      <a
        href={ctaHref}
        className={cn(
          'mt-6 inline-flex items-center justify-center rounded-[var(--radius-button)] px-8 py-3 font-semibold transition-colors duration-200',
          isHighlight
            ? 'border-[1.5px] border-white text-white hover:bg-white/10'
            : 'bg-forever-red hover:bg-forever-red-hover text-white',
        )}
      >
        {ctaText}
      </a>
    </section>
  );
}

export { CTABanner, type CTABannerProps, type CTAVariant };
