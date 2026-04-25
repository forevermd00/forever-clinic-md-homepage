import { cn } from '@/lib/utils/cn';

type HeroVariant = 'fullscreen' | 'page-title';

interface HeroBannerProps {
  variant: HeroVariant;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  videoSrc?: string;
  imageSrc?: string;
  className?: string;
}

function HeroBanner({
  variant,
  title,
  subtitle,
  ctaText,
  ctaHref,
  videoSrc,
  imageSrc,
  className,
}: HeroBannerProps) {
  if (variant === 'page-title') {
    return (
      <section
        className={cn(
          'bg-forever-beige flex items-center justify-center',
          'h-[200px] lg:h-[260px]',
          className,
        )}
      >
        <h1 className="text-forever-charcoal text-center text-[28px] font-bold lg:text-[36px]">
          {title}
        </h1>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        'h-[60vh] max-h-[600px] md:h-[70vh] lg:h-[80vh]',
        className,
      )}
    >
      {/* Background media */}
      {videoSrc ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center text-white">
        <h1 className="text-[28px] font-bold md:text-[36px] lg:text-[40px]">
          {title}
        </h1>
        {subtitle && <p className="text-[18px] text-white/90">{subtitle}</p>}
        {ctaText && ctaHref && (
          <a
            href={ctaHref}
            className="bg-forever-red hover:bg-forever-red-hover mt-2 inline-flex items-center justify-center rounded-[4px] px-10 py-4 font-medium text-white transition-colors duration-200"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

export { HeroBanner, type HeroBannerProps, type HeroVariant };
