import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import CreateProjectModal from "./CreateProjectModal";
import { useAuthStore } from "@/store/authStore";

export default function ProjectSwitcher() {
  const projects       = useProjectStore((s) => s.projects);
  const activeProject  = useProjectStore((s) => s.activeProject);
  const setActive      = useProjectStore((s) => s.setActiveProject);
  const user           = useAuthStore((s) => s.user);
  const isAdmin        = user?.systemRole === "admin";

  const [open,       setOpen]       = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  if (projects.length === 0 && !isAdmin) return null;

  return (
    <>
      <div className="relative px-4 pb-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
        >
          <div className="flex min-w-0 items-center gap-2">
            {activeProject ? (
              <>
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: activeProject.color ?? "#6366f1" }}
                />
                <span className="truncate">{activeProject.name}</span>
              </>
            ) : (
              <span className="text-zinc-500">Select project…</span>
            )}
          </div>
          <ChevronDown size={14} className={`flex-shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute left-4 right-4 top-full z-50 mt-1 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 shadow-lg">
            {projects.length === 0 && (
              <p className="px-4 py-3 text-xs text-zinc-500">No projects yet</p>
            )}
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => { setActive(p); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-zinc-700 ${
                  activeProject?.id === p.id ? "bg-cyan-500/10 font-semibold text-cyan-400" : "text-zinc-300"
                }`}
              >
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color ?? "#6366f1" }} />
                <span className="truncate">{p.name}</span>
                {p._count && (
                  <span className="ml-auto text-xs text-zinc-500">{p._count.tasks} tasks</span>
                )}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => { setOpen(false); setShowCreate(true); }}
                className="flex w-full items-center gap-2 border-t border-zinc-700 px-4 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10"
              >
                <Plus size={14} />
                New Project
              </button>
            )}
          </div>
        )}
      </div>

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
