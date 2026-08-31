import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
