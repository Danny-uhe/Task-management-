import { AlertTriangle, X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
      <div className='w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100'>
              <AlertTriangle size={18} className='text-red-600' />
            </div>
            <h3 className='font-bold text-slate-900'>{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className='rounded-lg p-1 text-slate-400 hover:bg-slate-100'
          >
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <p className='mt-4 text-sm leading-relaxed text-slate-500'>{message}</p>

        {/* Actions */}
        <div className='mt-6 flex justify-end gap-3'>
          <button
            onClick={onCancel}
            className='rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700'
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
