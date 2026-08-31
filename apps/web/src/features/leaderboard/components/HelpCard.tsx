import { Mail } from 'lucide-react';

export default function HelpCard() {
  return (
    <div className='rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-5'>
      <h2 className='font-bold text-gray-900'>Need help with performance?</h2>
      <p className='mt-1 text-sm text-gray-600'>
        Talk to your team lead or explore our productivity guide.
      </p>

      <button
        id='contact-support-btn'
        className='mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-500 transition-colors hover:text-blue-800'
      >
        Contact Support
        <Mail className='h-4 w-4' />
      </button>
    </div>
  );
}
