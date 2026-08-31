import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

import InputError from './InputError';
import InputLabel from './InputLabel';
import type { InputProps } from './Input.types';

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, className, id, ...props },
    ref,
  ) => {
    const inputId = id ?? props.name;

    return (
      <div className='w-full'>
        {label && <InputLabel htmlFor={inputId!}>{label}</InputLabel>}

        <div className='relative'>
          {leftIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2'>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 text-[var(--color-text-primary)] outline-none transition-all',
              'focus:border-[var(--color-primary)]',
              error && 'border-[var(--color-danger)]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            aria-invalid={!!error}
            {...props}
          />

          {rightIcon && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2'>
              {rightIcon}
            </div>
          )}
        </div>

        {helperText && !error && (
          <p className='mt-1 text-sm text-[var(--color-text-secondary)]'>
            {helperText}
          </p>
        )}

        <InputError message={error} />
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
