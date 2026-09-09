import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        'w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
