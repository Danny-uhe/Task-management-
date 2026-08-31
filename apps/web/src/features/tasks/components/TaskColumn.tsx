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
      className={`rounded-2xl border bg-white p-5 transition-all duration-200 ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <h2 className='mb-5 text-xl font-bold'>{title}</h2>

      <div className='min-h-[420px] space-y-4'>{children}</div>
    </div>
  );
}
