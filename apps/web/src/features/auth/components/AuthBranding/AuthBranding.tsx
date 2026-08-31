import { CheckCircle2 } from 'lucide-react';
import type { AuthBrandingProps } from './AuthBranding.types';

export default function AuthBranding({
  quote,
  author,
  statOne,
  statOneLabel,
  statTwo,
  statTwoLabel,
  features,
}: AuthBrandingProps) {
  return (
    <div className='flex h-full flex-col bg-gradient-to-b from-[#2F5FE8] to-[#4A83F5] px-8 py-10 text-white'>
      {/* Logo */}
      <div>
        <h1 className='text-[34px] font-bold leading-none'>TaskSync</h1>

        <p className='mt-1 text-[11px] font-medium tracking-[0.35em] text-white/80'>
          WORKSPACE
        </p>
      </div>

      {/* Quote */}
      <div className='mt-auto mb-24 max-w-[360px]'>
        <h2 className='text-[22px] font-semibold leading-[40px]'>{quote}</h2>

        <p className='mt-8 text-[16px] text-white/80'>{author}</p>
      </div>

      {/* Stats */}
      <div className='flex gap-16'>
        <div>
          <h3 className='text-[42px] font-bold leading-none'>{statOne}</h3>

          <p className='mt-2 text-sm text-white/80'>{statOneLabel}</p>
        </div>

        <div>
          <h3 className='text-[42px] font-bold leading-none'>{statTwo}</h3>

          <p className='mt-2 text-sm text-white/80'>{statTwoLabel}</p>
        </div>
      </div>

      {/* Features */}
      <div className='mt-10 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md'>
        <div className='space-y-4'>
          {features.map((feature) => (
            <div key={feature} className='flex items-center gap-3'>
              <CheckCircle2
                size={18}
                className='text-white'
                strokeWidth={2.5}
              />

              <span className='text-[15px]'>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
