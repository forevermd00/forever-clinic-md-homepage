import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type SectionBackground = 'default' | 'ivory' | 'beige' | 'white';
type SectionPadding = 'sm' | 'md' | 'lg';

interface SectionLayoutProps {
  label?: string;
  title?: string;
  subtitle?: string;
  background?: SectionBackground;
  padding?: SectionPadding;
  children: ReactNode;
  className?: string;
  id?: string;
}

const bgStyles: Record<SectionBackground, string> = {
  default: 'bg-forever-ivory',
  ivory: 'bg-forever-ivory',
  beige: 'bg-forever-beige',
  white: 'bg-white',
};

const paddingStyles: Record<SectionPadding, string> = {
  sm: 'py-12',
  md: 'py-16',
  lg: 'py-20',
};

function SectionLayout({
  label,
  title,
  subtitle,
  background = 'default',
  padding = 'md',
  children,
  className,
  id,
}: SectionLayoutProps) {
  return (
    <section
      id={id}
      className={cn(
        bgStyles[background],
        paddingStyles[padding],
        'px-4 md:px-6 lg:px-12',
        className,
      )}
    >
      <div className="mx-auto max-w-[var(--container-max)]">
        {(label || title || subtitle) && (
          <div className="mb-10">
            {label && (
              <span className="text-forever-red mb-2 block text-[13px] font-semibold tracking-wider uppercase">
                {label}
              </span>
            )}
            {title && (
              <h2 className="text-forever-charcoal text-[32px] font-bold">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-base text-neutral-500">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export {
  SectionLayout,
  type SectionLayoutProps,
  type SectionBackground,
  type SectionPadding,
};
