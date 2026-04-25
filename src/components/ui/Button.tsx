'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-forever-red text-neutral-50 hover:bg-forever-red-hover',
  secondary:
    'border-[1.5px] border-forever-charcoal text-forever-charcoal bg-transparent hover:bg-neutral-100',
  ghost: 'bg-transparent text-forever-charcoal hover:bg-neutral-100',
  text: 'bg-transparent text-forever-red hover:underline',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 py-2 text-[13px]',
  md: 'h-11 px-6 py-3 text-[15px]',
  lg: 'h-[52px] px-8 py-4 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'rounded-[var(--radius-button)]',
          'transition-[background-color,border-color,box-shadow] duration-200',
          'cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          disabled && 'pointer-events-none opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
