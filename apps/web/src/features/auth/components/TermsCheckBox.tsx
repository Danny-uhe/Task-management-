import { type ReactNode } from 'react';
import { Check } from 'lucide-react';

interface Props {
  checked: boolean;
  label: ReactNode;
  onChange: () => void;
}

export default function TermsCheckBox({ checked, label, onChange }: Props) {
  return (
    <label className='flex items-center gap-2 cursor-pointer'>
      <button
        type='button'
        onClick={onChange}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          checked
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
            : 'border-[var(--color-border)]'
        }`}
      >
        {checked && <Check size={12} className='text-white' />}
      </button>

      <span className='text-sm text-[var(--color-text-secondary)]'>
        {label}
      </span>
    </label>
  );
}
