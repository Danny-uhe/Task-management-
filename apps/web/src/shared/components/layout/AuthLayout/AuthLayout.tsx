import type { AuthLayoutProps } from './AuthLayout.types';
import VantaGlobe from '@/features/auth/components/VantaGlobe';

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    // bg-[#100f18] matches vanta backgroundColor exactly — no flash of wrong colour
    <main className='relative flex min-h-screen items-center justify-center bg-[#100f18] px-5 py-12'>

      {/* Animated 3-D globe background */}
      <VantaGlobe />

      {/* Frosted-glass login card — sits above the canvas */}
      <div className='relative z-10 w-full max-w-[420px]'>
        <header className='mb-8 text-center'>
          <img
            src='/favicon.svg'
            alt=''
            aria-hidden='true'
            className='mx-auto mb-4 h-12 w-12 drop-shadow-[0_0_12px_rgba(96,63,255,0.8)]'
          />
          <p className='text-3xl font-bold tracking-tight text-white'>
            Task<span className='text-violet-400'>Sync</span>
          </p>
          <p className='mt-2 text-sm text-zinc-400'>
            A clearer way to work together.
          </p>
        </header>

        {/* Card with subtle glass effect */}
        <section className='rounded-2xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/60 backdrop-blur-md sm:p-8'>
          {children}
        </section>
      </div>
    </main>
  );
}
