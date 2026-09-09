import { useState } from 'react';
import AppLayout from '@/layout/AppLayout';
import TodayProgressCard from '@/features/dashboard/components/TodayProgressCard';
import TaskCard from '../components/TaskCard';
import ActivityItem from '../components/ActivityItem';
import { useTaskContext } from '@/app/Providers/TaskContext';
import EditTaskModal from '@/features/tasks/components/EditTaskModal';
import TaskDetailPanel from '@/features/tasks/components/TaskDetailPanel';
import type { Task } from '@/features/tasks/types/types';

/* ── Static dashboard tasks (personal quick-add list) ── */
type DashTask = { id: number; title: string; priority: 'High' | 'Medium' | 'Low'; time: string };

const INITIAL: DashTask[] = [
  { id: 1, title: 'Quarterly Budget Review', priority: 'High',   time: '9:30 AM'  },
  { id: 2, title: 'Draft Team Guidelines',   priority: 'Medium', time: '11:00 AM' },
  { id: 3, title: 'Client Feedback Sync',    priority: 'Low',    time: '2:00 PM'  },
];

export default function DashboardPage() {
  const { openAddTask, tasks } = useTaskContext();

  const [dashTasks, setDashTasks] = useState<DashTask[]>(INITIAL);
  const [viewTask,  setViewTask]  = useState<Task | null>(null);
  const [editTask,  setEditTask]  = useState<Task | null>(null);

  /* find full Task object from context by title (best-effort) */
  const findTask = (title: string) =>
    tasks.find((t) => t.title === title) ?? null;

  const handleDelete = (id: number) =>
    setDashTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <AppLayout>
      <div className='space-y-5 sm:space-y-6'>

        {/* Top Section */}
        <div className='grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6'>
          {/* Progress card */}
          <div className='lg:col-span-4'>
            <TodayProgressCard />
          </div>

          {/* Today's Tasks */}
          <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-8'>
            <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <h2 className='text-lg font-semibold sm:text-xl'>Today's Tasks</h2>
              <button
                onClick={openAddTask}
                className='w-fit rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:px-5'
              >
                + Add Personal Task
              </button>
            </div>

            <div className='space-y-3 sm:space-y-4'>
              {dashTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  priority={task.priority}
                  time={task.time}
                  onView={() => {
                    const full = findTask(task.title);
                    if (full) setViewTask(full);
                  }}
                  onEdit={() => {
                    const full = findTask(task.title);
                    if (full) setEditTask(full);
                  }}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}

              {dashTasks.length === 0 && (
                <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-slate-400'>
                  <p className='text-sm font-medium'>No tasks for today</p>
                  <button
                    onClick={openAddTask}
                    className='mt-3 text-sm font-semibold text-blue-500 hover:underline'
                  >
                    + Add your first task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-center justify-between'>
            <h2 className='text-base font-semibold sm:text-lg'>Recent Activity</h2>
            <button className='text-sm font-medium text-blue-600 hover:underline'>
              View All
            </button>
          </div>

          <div className='divide-y divide-gray-100'>
            <ActivityItem
              type='completed'
              title='Completed "Review Project Roadmap"'
              time='2h ago'
            />
            <ActivityItem type='points' title='Earned 50 points' time='4h ago' />
            <ActivityItem
              type='member'
              title='Added to "Q4 Planning" by Sarah Miller'
              time='Yesterday'
            />
          </div>
        </div>
      </div>

      {/* View task detail panel — slide from right */}
      {viewTask && (
        <>
          <div className='fixed inset-0 z-40 bg-black/40' onClick={() => setViewTask(null)} />
          <div className='fixed right-0 top-0 z-50 flex h-screen w-full max-w-[420px] flex-col overflow-hidden bg-white shadow-2xl'>
            <TaskDetailPanel
              task={viewTask}
              onClose={() => setViewTask(null)}
              onEdit={() => { setEditTask(viewTask); setViewTask(null); }}
            />
          </div>
        </>
      )}

      {/* Edit task modal */}
      <EditTaskModal
        open={editTask !== null}
        task={editTask}
        onClose={() => setEditTask(null)}
      />
    </AppLayout>
  );
}
