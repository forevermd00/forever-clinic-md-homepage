'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, disabled, rows = 3, className, id, ...props },
    ref,
  ) => {
    const textareaId =
      id ??
      (label
        ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}`
        : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-[13px] font-medium text-neutral-600"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={cn(
            'bg-forever-ivory rounded-[var(--radius-input)] border border-neutral-300',
            'text-forever-charcoal px-4 py-3 text-[15px]',
            'placeholder:text-neutral-400',
            'transition-[border-color] duration-200',
            'focus:border-forever-red focus:border-2 focus:outline-none',
            'min-h-[80px] resize-y',
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

Textarea.displayName = 'Textarea';

export { Textarea, type TextareaProps };
