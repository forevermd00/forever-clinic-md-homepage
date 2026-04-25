import { cn } from '@/lib/utils/cn';

type DividerVariant = 'line' | 'dot' | 'space';

interface DividerProps {
  variant?: DividerVariant;
  className?: string;
}

function Divider({ variant = 'line', className }: DividerProps) {
  if (variant === 'space') {
    return <div className={cn('h-10', className)} aria-hidden="true" />;
  }

  if (variant === 'dot') {
    return (
      <div
        className={cn('flex items-center justify-center gap-2', className)}
        aria-hidden="true"
      >
        <span className="size-1 rounded-full bg-neutral-300" />
        <span className="size-1 rounded-full bg-neutral-300" />
        <span className="size-1 rounded-full bg-neutral-300" />
      </div>
    );
  }

  return <hr className={cn('h-px border-0 bg-neutral-200', className)} />;
}

export { Divider, type DividerProps, type DividerVariant };
