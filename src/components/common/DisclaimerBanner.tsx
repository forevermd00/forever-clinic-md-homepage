import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type DisclaimerVariant = 'inline' | 'fixed';

interface DisclaimerBannerProps {
  variant?: DisclaimerVariant;
  children: ReactNode;
  className?: string;
}

function DisclaimerBanner({
  variant = 'inline',
  children,
  className,
}: DisclaimerBannerProps) {
  if (variant === 'fixed') {
    return (
      <div
        className={cn(
          'fixed right-0 bottom-0 left-0 z-50 bg-neutral-800 px-6 py-3 text-center text-[13px] text-white',
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-neutral-100 p-4 text-[13px] text-neutral-600',
        className,
      )}
    >
      {children}
    </div>
  );
}

export { DisclaimerBanner, type DisclaimerBannerProps, type DisclaimerVariant };
