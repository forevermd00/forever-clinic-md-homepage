import { cn } from '@/lib/utils/cn';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-[var(--radius-card)]',
};

function Skeleton({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-neutral-200',
        variantStyles[variant],
        variant === 'text' && !height && 'h-4',
        variant === 'circular' && !width && 'size-10',
        variant === 'rectangular' && !height && 'h-24',
        className,
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

export { Skeleton, type SkeletonProps, type SkeletonVariant };
