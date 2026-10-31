import { useState } from 'react';
import { Plus, Folder, CheckSquare, Users, Loader2 } from 'lucide-react';
import AppLayout from '@/layout/AppLayout';
import TodayProgressCard from '@/features/dashboard/components/TodayProgressCard';
import { useTaskContext } from '@/app/Providers/TaskContext';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import EditTaskModal from '@/features/tasks/components/EditTaskModal';
import TaskDetailPanel from '@/features/tasks/components/TaskDetailPanel';
import CreateProjectModal from '@/features/projects/components/CreateProjectModal';
import type { Task } from '@/features/tasks/types/types';

export default function DashboardPage() {
  const { tasks, loading: tasksLoading, openAddTask } = useTaskContext();
  const projects      = useProjectStore((s) => s.projects);
  const activeProject = useProjectStore((s) => s.activeProject);
  const setActive     = useProjectStore((s) => s.setActiveProject);
  const projLoading   = useProjectStore((s) => s.loading);
  const user          = useAuthStore((s) => s.user);
  const isAdmin       = user?.systemRole === 'admin';

  const [viewTask,       setViewTask]       = useState<Task | null>(null);
  const [editTask,       setEditTask]       = useState<Task | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);

  // Tasks for the active project
  const projectTasks = activeProject
    ? tasks.filter((t) => t.projectId === activeProject.id)
    : tasks;

  const todoCount       = projectTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = projectTasks.filter((t) => t.status === 'in_progress').length;
  const doneCount       = projectTasks.filter((t) => t.status === 'done').length;
  const recentTasks     = projectTasks.slice(0, 5);

  return (
    <AppLayout>
      <div className='space-y-5 sm:space-y-6'>

        {/* â”€â”€ Top row â”€â”€ */}
        <div className='grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6'>
          {/* Progress card */}
          <div className='lg:col-span-4'>
            <TodayProgressCard />
          </div>

          {/* Quick stats */}
          <div className='grid grid-cols-3 gap-4 lg:col-span-8'>
            {[
              { label: 'To Do',       count: todoCount,       color: 'bg-slate-100  text-slate-600'  },
              { label: 'In Progress', count: inProgressCount, color: 'bg-blue-100   text-blue-600'   },
              { label: 'Done',        count: doneCount,       color: 'bg-green-100  text-green-600'  },
            ].map(({ label, count, color }) => (
              <div key={label} className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
                <p className='text-sm text-gray-500'>{label}</p>
                <p className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-2xl font-bold ${color}`}>
                  {tasksLoading ? <Loader2 size={20} className='animate-spin' /> : count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* â”€â”€ Projects â”€â”€ */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-center justify-between'>
            <h2 className='text-base font-semibold sm:text-lg'>My Projects</h2>
            {isAdmin && (
              <button
                onClick={() => setShowNewProject(true)}
                className='flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
              >
                <Plus size={15} /> New Project
              </button>
            )}
          </div>

          {projLoading ? (
            <div className='flex items-center justify-center py-10'>
              <Loader2 size={24} className='animate-spin text-blue-500' />
            </div>
          ) : projects.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-slate-400'>
              <Folder size={36} className='mb-3 opacity-40' />
              <p className='text-sm font-medium'>No projects yet</p>
              {isAdmin && (
                <button
                  onClick={() => setShowNewProject(true)}
                  className='mt-3 text-sm font-semibold text-blue-500 hover:underline'
                >
                  + Create your first project
                </button>
              )}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {projects.map((p) => {
                const pTasks   = tasks.filter((t) => t.projectId === p.id);
                const pDone    = pTasks.filter((t) => t.status === 'done').length;
                const progress = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0;
                const isActive = activeProject?.id === p.id;

                return (
                  <button
                    key={p.id}
                    onClick={() => setActive(p)}
                    className={`group rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                      isActive
                        ? 'border-blue-400 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-2'>
                        <span
                          className='h-3 w-3 rounded-full flex-shrink-0'
                          style={{ backgroundColor: p.color ?? '#6366f1' }}
                        />
                        <h3 className='font-semibold text-gray-900 truncate'>{p.name}</h3>
                      </div>
                      {isActive && (
                        <span className='rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white'>
                          Active
                        </span>
                      )}
                    </div>

                    {p.description && (
                      <p className='mt-1.5 text-xs text-gray-500 line-clamp-2'>{p.description}</p>
                    )}

                    <div className='mt-3 flex items-center gap-3 text-xs text-gray-500'>
                      <span className='flex items-center gap-1'>
                        <CheckSquare size={12} /> {pTasks.length} tasks
                      </span>
                      <span className='flex items-center gap-1'>
                        <Users size={12} /> {p._count?.members ?? 'â€“'} members
                      </span>
                    </div>

                    {pTasks.length > 0 && (
                      <div className='mt-3'>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-[10px] text-gray-400'>Progress</span>
                          <span className='text-[10px] font-semibold text-gray-600'>{progress}%</span>
                        </div>
                        <div className='h-1.5 w-full rounded-full bg-gray-100'>
                          <div
                            className='h-1.5 rounded-full bg-blue-500 transition-all'
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* â”€â”€ Recent tasks for active project â”€â”€ */}
        <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-center justify-between'>
            <h2 className='text-base font-semibold sm:text-lg'>
              Recent Tasks
              {activeProject && (
                <span className='ml-2 text-sm font-normal text-gray-400'>â€” {activeProject.name}</span>
              )}
            </h2>
            <button
              onClick={openAddTask}
              className='flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50'
            >
              <Plus size={14} /> Add Task
            </button>
          </div>

          {tasksLoading ? (
            <div className='flex items-center justify-center py-10'>
              <Loader2 size={24} className='animate-spin text-blue-500' />
            </div>
          ) : recentTasks.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-slate-400'>
              <p className='text-sm font-medium'>No tasks yet</p>
              <button onClick={openAddTask} className='mt-2 text-sm font-semibold text-blue-500 hover:underline'>
                + Add your first task
              </button>
            </div>
          ) : (
            <div className='space-y-2'>
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setViewTask(task)}
                  className='flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-50'
                >
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    task.status === 'done'        ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-blue-500'  :
                    task.status === 'in_review'   ? 'bg-purple-500': 'bg-gray-300'
                  }`} />
                  <span className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    task.priority === 'high'   ? 'bg-red-100 text-red-600'    :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal open={showNewProject} onClose={() => setShowNewProject(false)} />

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

      <EditTaskModal open={editTask !== null} task={editTask} onClose={() => setEditTask(null)} />
    </AppLayout>
  );
}

