import { cva } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

import type { ButtonProps } from './Button.types';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',

        secondary: 'bg-slate-100 text-slate-700',

        outline: 'border border-[var(--color-border)] bg-white',

        ghost: 'hover:bg-slate-100',

        danger: 'bg-[var(--color-danger)] text-white',
      },

      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-4',
        lg: 'h-12 px-6',
      },
    },

    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export default function Button({
  className,
  variant,
  size,
  loading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
