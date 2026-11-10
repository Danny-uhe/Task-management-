import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export default function TaskColumn({ id, title, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-5 transition-all duration-200 ${
        isOver ? 'border-cyan-500 bg-cyan-500/5' : 'border-zinc-700 bg-zinc-900'
      }`}
    >
      <h2 className='mb-5 text-xl font-bold text-white'>{title}</h2>

      <div className='min-h-[420px] space-y-4'>{children}</div>
    </div>
  );
}
