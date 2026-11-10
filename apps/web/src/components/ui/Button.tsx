import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variants = {
  primary:   'bg-cyan-500 hover:bg-cyan-600 text-white',
  secondary: 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
};

export default function Button({
  variant = 'primary',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'h-11 rounded-lg px-4 font-medium transition-all duration-200 disabled:opacity-50',
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className='flex items-center justify-center gap-2'>
          <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24' fill='none'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
}
