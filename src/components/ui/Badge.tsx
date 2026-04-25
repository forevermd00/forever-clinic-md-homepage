import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'red' | 'beige' | 'taupe' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  red: 'bg-forever-red text-neutral-50',
  beige: 'bg-forever-beige text-forever-charcoal',
  taupe: 'bg-forever-taupe text-forever-charcoal',
  outline: 'border border-neutral-300 text-forever-charcoal bg-transparent',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-[11px]',
  md: 'px-3 py-1.5 text-[13px]',
};

function Badge({
  variant = 'red',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold',
        'rounded-[var(--radius-badge)]',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize };
