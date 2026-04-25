import { cn } from '@/lib/utils/cn';

type HeadingLevel = 'h1' | 'h2' | 'h3';

interface SectionTitleProps {
  as?: HeadingLevel;
  align?: 'left' | 'center';
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const headingStyles: Record<HeadingLevel, string> = {
  h1: 'text-[40px]',
  h2: 'text-[32px]',
  h3: 'text-[24px]',
};

const subtitleStyles: Record<HeadingLevel, string> = {
  h1: 'text-[18px]',
  h2: 'text-[14px]',
  h3: 'text-[11px]',
};

function SectionTitle({
  as: Tag = 'h2',
  align = 'left',
  subtitle,
  children,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <Tag
        className={cn(
          'text-forever-charcoal leading-tight font-bold',
          headingStyles[Tag],
        )}
      >
        {children}
      </Tag>
      {subtitle && (
        <p className={cn('font-normal text-neutral-500', subtitleStyles[Tag])}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export { SectionTitle, type SectionTitleProps, type HeadingLevel };
