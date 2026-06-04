import { cn } from '@/lib/utils/cn';

type CardVariant = 'treatment' | 'info' | 'stat' | 'testimonial';
type CardSize = 'default' | 'compact';

interface BaseCardProps {
  variant: CardVariant;
  size?: CardSize;
  image?: { src: string; alt: string };
  title: string;
  description: string;
  badge?: React.ReactNode;
  href?: string;
  className?: string;
}

const sizeStyles: Record<CardSize, string> = {
  default: 'p-6 gap-3',
  compact: 'p-4 gap-3',
};

function TreatmentContent({
  image,
  title,
  description,
  badge,
  size = 'default',
}: Pick<BaseCardProps, 'image' | 'title' | 'description' | 'badge' | 'size'>) {
  return (
    <>
      <div
        className={cn(
          'bg-forever-beige overflow-hidden rounded-[4px]',
          size === 'default' ? 'h-[180px]' : 'h-[120px]',
        )}
      >
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      {badge && <div className="self-start">{badge}</div>}
      <h3
        className={cn(
          'text-forever-charcoal font-semibold',
          size === 'default' ? 'text-[20px]' : 'text-[16px]',
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'text-neutral-600',
          size === 'default' ? 'text-[15px]' : 'text-[13px]',
        )}
      >
        {description}
      </p>
    </>
  );
}

function InfoContent({
  title,
  description,
  size = 'default',
}: Pick<BaseCardProps, 'title' | 'description' | 'size'>) {
  return (
    <>
      <h3
        className={cn(
          'text-forever-charcoal font-semibold',
          size === 'default' ? 'text-[20px]' : 'text-[16px]',
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'text-neutral-600',
          size === 'default' ? 'text-[15px]' : 'text-[13px]',
        )}
      >
        {description}
      </p>
    </>
  );
}

function StatContent({
  title,
  description,
  size = 'default',
}: Pick<BaseCardProps, 'title' | 'description' | 'size'>) {
  return (
    <>
      <span
        className={cn(
          'text-forever-red font-semibold',
          size === 'default' ? 'text-[36px]' : 'text-[28px]',
        )}
      >
        {title}
      </span>
      <p
        className={cn(
          'text-neutral-600',
          size === 'default' ? 'text-[15px]' : 'text-[13px]',
        )}
      >
        {description}
      </p>
    </>
  );
}

function TestimonialContent({
  title,
  description,
  size = 'default',
}: Pick<BaseCardProps, 'title' | 'description' | 'size'>) {
  return (
    <>
      <blockquote
        className={cn(
          'text-forever-charcoal',
          size === 'default' ? 'text-[16px]' : 'text-[14px]',
        )}
      >
        {description}
      </blockquote>
      <div className="bg-forever-taupe h-px w-10" />
      <cite
        className={cn(
          'font-semibold text-neutral-600 not-italic',
          size === 'default' ? 'text-[14px]' : 'text-[13px]',
        )}
      >
        {title}
      </cite>
    </>
  );
}

function BaseCard({
  variant,
  size = 'default',
  image,
  title,
  description,
  badge,
  href,
  className,
}: BaseCardProps) {
  const content = (() => {
    switch (variant) {
      case 'treatment':
        return (
          <TreatmentContent
            image={image}
            title={title}
            description={description}
            badge={badge}
            size={size}
          />
        );
      case 'info':
        return (
          <InfoContent title={title} description={description} size={size} />
        );
      case 'stat':
        return (
          <StatContent title={title} description={description} size={size} />
        );
      case 'testimonial':
        return (
          <TestimonialContent
            title={title}
            description={description}
            size={size}
          />
        );
    }
  })();

  const cardClasses = cn(
    'flex w-full flex-col bg-forever-ivory rounded-[var(--radius-card)] shadow-[var(--shadow-card)]',
    sizeStyles[size],
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        className={cardClasses}
        data-ga-id={`ui-base-card.link-${href.replace(/^\//, '').replace(/[/?#]/g, '-')}`}
      >
        {content}
      </a>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}

export { BaseCard, type BaseCardProps, type CardVariant, type CardSize };
