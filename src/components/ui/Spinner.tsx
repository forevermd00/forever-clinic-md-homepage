import { cn } from '@/lib/utils/cn';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full',
        'border-t-forever-red border-2 border-neutral-200',
        sizeStyles[size],
        className,
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export { Spinner, type SpinnerProps, type SpinnerSize };
