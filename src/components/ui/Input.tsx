'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, disabled, className, id, ...props }, ref) => {
    const inputId =
      id ??
      (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-neutral-600"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'bg-forever-ivory rounded-[var(--radius-input)] border border-neutral-300',
            'text-forever-charcoal px-4 py-3 text-[15px]',
            'placeholder:text-neutral-400',
            'transition-[border-color] duration-200',
            'focus:border-forever-red focus:border-2 focus:outline-none',
            error && 'border-error',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
          {...props}
        />
        {error && <p className="text-error text-[13px]">{error}</p>}
        {!error && helperText && (
          <p className="text-[13px] text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input, type InputProps };
