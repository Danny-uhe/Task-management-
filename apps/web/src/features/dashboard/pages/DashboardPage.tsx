import { useState } from 'react';
import { Plus, Folder, CheckSquare, Users, UserPlus, Loader2 } from 'lucide-react';
import AppLayout from '@/layout/AppLayout';
import TodayProgressCard from '@/features/dashboard/components/TodayProgressCard';
import { useTaskContext } from '@/app/Providers/TaskContext';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import EditTaskModal from '@/features/tasks/components/EditTaskModal';
import TaskDetailPanel from '@/features/tasks/components/TaskDetailPanel';
import CreateProjectModal from '@/features/projects/components/CreateProjectModal';
import ProjectMembersDialog from '@/features/projects/components/ProjectMembersDialog';
import type { ApiProject } from '@/services/project.service';
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
  const [memberProject,  setMemberProject]  = useState<ApiProject | null>(null);

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

        {/* ── Top row ── */}
        <div className='grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6'>
          {/* Progress card */}
          <div className='lg:col-span-4'>
            <TodayProgressCard />
          </div>

          {/* Quick stats */}
          <div className='grid grid-cols-3 gap-4 lg:col-span-8'>
            {[
              { label: 'To Do',       count: todoCount,       color: 'bg-zinc-800 text-zinc-300'    },
              { label: 'In Progress', count: inProgressCount, color: 'bg-cyan-500/10 text-cyan-400' },
              { label: 'Done',        count: doneCount,       color: 'bg-green-500/10 text-green-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className='rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-sm'>
                <p className='text-sm text-zinc-400'>{label}</p>
                <p className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-2xl font-bold ${color}`}>
                  {tasksLoading ? <Loader2 size={20} className='animate-spin' /> : count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Projects ── */}
        <div className='rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-center justify-between'>
            <h2 className='text-base font-semibold text-white sm:text-lg'>My Projects</h2>
            {isAdmin && (
              <button
                onClick={() => setShowNewProject(true)}
                className='flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600'
              >
                <Plus size={15} /> New Project
              </button>
            )}
          </div>

          {projLoading ? (
            <div className='flex items-center justify-center py-10'>
              <Loader2 size={24} className='animate-spin text-cyan-500' />
            </div>
          ) : projects.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-12 text-zinc-500'>
              <Folder size={36} className='mb-3 opacity-40' />
              <p className='text-sm font-medium'>No projects yet</p>
              {isAdmin && (
                <button
                  onClick={() => setShowNewProject(true)}
                  className='mt-3 text-sm font-semibold text-cyan-400 hover:underline'
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
                  <article
                    key={p.id}
                    className={`group relative rounded-xl border p-4 transition-all hover:shadow-md ${
                      isActive
                        ? 'border-cyan-500/50 bg-cyan-500/5 shadow-sm'
                        : 'border-zinc-700 bg-zinc-800 hover:border-cyan-500/30'
                    }`}
                  >
                    <button
                      type='button'
                      onClick={() => setActive(p)}
                      aria-label={`Select ${p.name} project`}
                      aria-pressed={isActive}
                      className='absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900'
                    />
                    <div className='relative'>
                      <div className='flex min-w-0 items-start justify-between gap-2'>
                        <div className='pointer-events-none flex min-w-0 items-center gap-2'>
                          <span
                            className='h-3 w-3 rounded-full flex-shrink-0'
                            style={{ backgroundColor: p.color ?? '#6366f1' }}
                          />
                          <h3 className='truncate font-semibold text-white'>{p.name}</h3>
                        </div>
                        {p.ownerId === user?.id && (
                          <button
                            type='button'
                            onClick={() => setMemberProject(p)}
                            aria-label={`Manage members for ${p.name}`}
                            className='z-20 inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-600 bg-zinc-700 px-2.5 text-xs font-semibold text-zinc-300 shadow-sm transition hover:border-cyan-500/50 hover:bg-zinc-600 hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2'
                          >
                            <UserPlus size={14} aria-hidden='true' />
                            <span>Manage</span>
                          </button>
                        )}
                      </div>

                      {isActive && (
                        <span className='pointer-events-none mt-1 inline-flex rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-bold text-white'>
                          Active
                        </span>
                      )}

                      {p.description && (
                        <p className='pointer-events-none mt-1.5 line-clamp-2 text-xs text-zinc-400'>{p.description}</p>
                      )}

                      <div className='pointer-events-none mt-3 flex items-center gap-3 text-xs text-zinc-500'>
                        <span className='flex items-center gap-1'>
                          <CheckSquare size={12} /> {pTasks.length} tasks
                        </span>
                        <span className='flex items-center gap-1'>
                          <Users size={12} /> {p._count?.members ?? '–'} members
                        </span>
                      </div>

                      {pTasks.length > 0 && (
                        <div className='pointer-events-none mt-3'>
                          <div className='mb-1 flex items-center justify-between'>
                            <span className='text-[10px] text-zinc-500'>Progress</span>
                            <span className='text-[10px] font-semibold text-zinc-400'>{progress}%</span>
                          </div>
                          <div className='h-1.5 w-full rounded-full bg-zinc-700'>
                            <div
                              className='h-1.5 rounded-full bg-cyan-500 transition-all'
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent tasks for active project ── */}
        <div className='rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-center justify-between'>
            <h2 className='text-base font-semibold text-white sm:text-lg'>
              Recent Tasks
              {activeProject && (
                <span className='ml-2 text-sm font-normal text-zinc-400'>— {activeProject.name}</span>
              )}
            </h2>
            <button
              onClick={openAddTask}
              className='flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800'
            >
              <Plus size={14} /> Add Task
            </button>
          </div>

          {tasksLoading ? (
            <div className='flex items-center justify-center py-10'>
              <Loader2 size={24} className='animate-spin text-cyan-500' />
            </div>
          ) : recentTasks.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-10 text-zinc-500'>
              <p className='text-sm font-medium'>No tasks yet</p>
              <button onClick={openAddTask} className='mt-2 text-sm font-semibold text-cyan-400 hover:underline'>
                + Add your first task
              </button>
            </div>
          ) : (
            <div className='space-y-2'>
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setViewTask(task)}
                  className='flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 hover:bg-zinc-800'
                >
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    task.status === 'done'        ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-cyan-500'  :
                    task.status === 'in_review'   ? 'bg-purple-500': 'bg-zinc-500'
                  }`} />
                  <span className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                    {task.title}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    task.priority === 'high'   ? 'bg-red-500/10 text-red-400'    :
                    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
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
      {memberProject && (
        <ProjectMembersDialog
          project={memberProject}
          isAdmin={isAdmin}
          onClose={() => setMemberProject(null)}
        />
      )}

      {viewTask && (
        <>
          <div className='fixed inset-0 z-40 bg-black/60' onClick={() => setViewTask(null)} />
          <div className='fixed right-0 top-0 z-50 flex h-screen w-full max-w-[420px] flex-col overflow-hidden bg-zinc-900 shadow-2xl'>
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
