import { useState } from 'react';
import AppLayout from '@/layout/AppLayout';

import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

import TaskToolbar from '../components/TaskToolbar';
import TaskColumn from '../components/TaskColumn';
import TaskBoardCard from '../components/TaskBoardCard';
import EditTaskModal from '../components/EditTaskModal';
import TaskDetailPanel from '../components/TaskDetailPanel';
import ListViewTask from '../components/ListViewTask';

import { useTaskContext } from '@/app/Providers/TaskContext';
import type { Task, TaskStatus } from '../types/types';

type FilterTab = 'Today' | 'Upcoming' | 'Completed' | 'Assigned';

/* Active filter chips shown above the list */
const filterChips = [
  { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { label: 'High Priority', color: 'bg-red-100 text-red-600' },
];

/** Overall progress bar across all tasks */
function ProgressSummary({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;
  const done       = tasks.filter((t) => t.status === 'done').length;
  const inReview   = tasks.filter((t) => t.status === 'in_review').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const pct        = Math.round((done / tasks.length) * 100);

  return (
    <div className='rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm'>
      <div className='mb-2 flex items-center justify-between text-sm'>
        <span className='font-semibold text-slate-700'>Overall Progress</span>
        <span className='font-bold text-blue-600'>{pct}%</span>
      </div>
      {/* Progress bar */}
      <div className='h-2.5 w-full overflow-hidden rounded-full bg-gray-100'>
        <div
          className='h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500'
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Breakdown pills */}
      <div className='mt-3 flex flex-wrap gap-3 text-xs'>
        <span className='flex items-center gap-1 text-slate-500'>
          <span className='inline-block h-2 w-2 rounded-full bg-slate-300' />
          To Do: <strong>{tasks.length - done - inReview - inProgress}</strong>
        </span>
        <span className='flex items-center gap-1 text-blue-600'>
          <span className='inline-block h-2 w-2 rounded-full bg-blue-400' />
          In Progress: <strong>{inProgress}</strong>
        </span>
        <span className='flex items-center gap-1 text-amber-600'>
          <span className='inline-block h-2 w-2 rounded-full bg-amber-400' />
          In Review: <strong>{inReview}</strong>
        </span>
        <span className='flex items-center gap-1 text-green-600'>
          <span className='inline-block h-2 w-2 rounded-full bg-green-400' />
          Done: <strong>{done}</strong>
        </span>
        <span className='ml-auto text-slate-400'>
          {done} of {tasks.length} tasks complete
        </span>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, moveTask, canApprove, setBoardDetailTask, boardDetailTask } =
    useTaskContext();

  /* ── View ── */
  const [view, setView] = useState<'list' | 'board'>('board');
  const [search, setSearch] = useState('');

  /* ── List-view state ── */
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Today');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;
  const taskToEdit   = tasks.find((t) => t.id === editTaskId)   ?? null;

  /* ── Board column derivations — filtered by search ── */
  const q = search.toLowerCase();
  const matchesSearch = (t: Task) =>
    !q ||
    t.title.toLowerCase().includes(q) ||
    (t.description ?? '').toLowerCase().includes(q);

  const todo       = tasks.filter((t) => t.status === 'todo'        && matchesSearch(t));
  const inProgress = tasks.filter((t) => t.status === 'in_progress' && matchesSearch(t));
  const inReview   = tasks.filter((t) => t.status === 'in_review'   && matchesSearch(t));
  const done       = tasks.filter((t) => t.status === 'done'        && matchesSearch(t));

  /* ── DnD ── */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const id   = String(active.id);
    const dest = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === id);

    // Guard: non-admins cannot drag to "done"
    if (dest === 'done' && task && !canApprove(task.projectId)) return;

    if (['todo', 'in_progress', 'in_review', 'done'].includes(dest)) {
      moveTask(id, dest);
    }
  };

  /* ── Filter tabs ── */
  const filterTabs: FilterTab[] = ['Today', 'Upcoming', 'Completed', 'Assigned'];
  const tabCounts = filterTabs.reduce<Record<FilterTab, number>>(
    (acc, tab) => {
      acc[tab] = tasks.filter((t) => t.filter === tab).length;
      return acc;
    },
    { Today: 0, Upcoming: 0, Completed: 0, Assigned: 0 },
  );
  /* List tasks filtered by active tab + search */
  const visibleTasks = tasks.filter(
    (t) => t.filter === activeFilter && matchesSearch(t),
  );

  return (
    <AppLayout>
      <div className='space-y-4'>
        <TaskToolbar
          view={view}
          onViewChange={setView}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setSelectedTaskId(null); // close detail panel when searching
          }}
        />

        {/* Progress summary bar */}
        <ProgressSummary tasks={tasks} />

        {/* ══════════ LIST VIEW ══════════ */}
        {view === 'list' && (
          <div>
            {/* Filter tabs + chips row */}
            <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
              <div className='flex flex-wrap gap-1'>
                {filterTabs.map((tab) => (
                  <button
                    key={tab}
                    id={`filter-tab-${tab.toLowerCase()}-btn`}
                    onClick={() => {
                      setActiveFilter(tab);
                      setSelectedTaskId(null);
                    }}
                    className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeFilter === tab
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                    <span
                      className={`flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        activeFilter === tab
                          ? 'bg-white/30 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {tabCounts[tab]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Filter chips */}
              <div className='flex flex-wrap items-center gap-2'>
                {filterChips.map((chip) => (
                  <span
                    key={chip.label}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${chip.color}`}
                  >
                    {chip.label}
                  </span>
                ))}
                <button className='ml-1 rounded-full p-1 text-slate-400 hover:bg-slate-100'>
                  ✕
                </button>
              </div>
            </div>

            {/* List + Detail panel */}
            <div
              className={`grid gap-5 ${
                selectedTask
                  ? 'grid-cols-1 md:grid-cols-[1fr_380px]'
                  : 'grid-cols-1'
              }`}
            >
              {/* Task list */}
              <div className='space-y-3'>
                {visibleTasks.length === 0 ? (
                  <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-slate-400'>
                    <p className='text-sm font-medium'>No tasks in this category</p>
                  </div>
                ) : (
                  visibleTasks.map((task) => (
                    <ListViewTask
                      key={task.id}
                      task={task}
                      selected={selectedTaskId === task.id}
                      onClick={() =>
                        setSelectedTaskId(
                          selectedTaskId === task.id ? null : task.id,
                        )
                      }
                    />
                  ))
                )}
              </div>

              {/* Detail panel — inline on md+, full-screen on mobile */}
              {selectedTask && (
                <>
                  <div className='sticky top-0 hidden h-fit max-h-[calc(100vh-120px)] overflow-hidden rounded-2xl md:block'>
                    <TaskDetailPanel
                      task={selectedTask}
                      onClose={() => setSelectedTaskId(null)}
                      onEdit={() => setEditTaskId(selectedTask.id)}
                    />
                  </div>

                  <div className='fixed inset-0 z-40 flex flex-col bg-white md:hidden'>
                    <div className='flex-1 overflow-y-auto'>
                      <TaskDetailPanel
                        task={selectedTask}
                        onClose={() => setSelectedTaskId(null)}
                        onEdit={() => setEditTaskId(selectedTask.id)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══════════ BOARD VIEW ══════════ */}
        {view === 'board' && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {/* Board-level empty state when search has no matches */}
            {search && todo.length === 0 && inProgress.length === 0 && inReview.length === 0 && done.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-20 text-slate-400'>
                <p className='font-semibold text-slate-600'>No tasks match "{search}"</p>
                <p className='mt-1 text-sm'>Try a different keyword or</p>
                <button
                  onClick={() => setSearch('')}
                  className='mt-3 rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700'
                >
                  Clear search
                </button>
              </div>
            ) : (
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4'>
              <TaskColumn id='todo' title='To Do'>
                {todo.map((task) => (
                  <TaskBoardCard key={task.id} task={task} onClick={(t) => setBoardDetailTask(t)} onEdit={(t) => { setBoardDetailTask(null); setEditTaskId(t.id); }} />
                ))}
              </TaskColumn>

              <TaskColumn id='in_progress' title='In Progress'>
                {inProgress.map((task) => (
                  <TaskBoardCard key={task.id} task={task} onClick={(t) => setBoardDetailTask(t)} onEdit={(t) => { setBoardDetailTask(null); setEditTaskId(t.id); }} />
                ))}
              </TaskColumn>

              <TaskColumn id='in_review' title='In Review'>
                {inReview.map((task) => (
                  <TaskBoardCard key={task.id} task={task} onClick={(t) => setBoardDetailTask(t)} onEdit={(t) => { setBoardDetailTask(null); setEditTaskId(t.id); }} />
                ))}
              </TaskColumn>

              {/* Done column — visually marked as "approval required" for non-admins */}
              <TaskColumn id='done' title='Done ✓'>
                {done.map((task) => (
                  <TaskBoardCard key={task.id} task={task} onClick={(t) => setBoardDetailTask(t)} onEdit={(t) => { setBoardDetailTask(null); setEditTaskId(t.id); }} />
                ))}
              </TaskColumn>
            </div>
            )}
          </DndContext>
        )}
      </div>

      <EditTaskModal
        open={editTaskId !== null}
        task={taskToEdit}
        onClose={() => setEditTaskId(null)}
      />

      {/* Board task detail panel — slide from right */}
      {boardDetailTask && (
        <>
          <div
            className='fixed inset-0 z-40 bg-black/40'
            onClick={() => setBoardDetailTask(null)}
          />
          <div className='fixed right-0 top-0 z-50 flex h-screen w-full max-w-[420px] flex-col overflow-hidden bg-white shadow-2xl'>
            <TaskDetailPanel
              task={boardDetailTask}
              onClose={() => setBoardDetailTask(null)}
              onEdit={() => {
                setEditTaskId(boardDetailTask.id);
                setBoardDetailTask(null);
              }}
            />
          </div>
        </>
      )}
    </AppLayout>
  );
}
