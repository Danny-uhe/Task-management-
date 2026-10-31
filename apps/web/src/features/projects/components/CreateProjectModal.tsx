import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { projectService } from "@/services/project.service";
import { useProjectStore } from "@/store/projectStore";
import toast from "react-hot-toast";

const COLOURS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#64748b", "#1e293b",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ open, onClose }: Props) {
  const [name, setName]           = useState("");
  const [description, setDesc]    = useState("");
  const [color, setColor]         = useState(COLOURS[0]);
  const [loading, setLoading]     = useState(false);
  const addProject                = useProjectStore((s) => s.addProject);
  const setActiveProject          = useProjectStore((s) => s.setActiveProject);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await projectService.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      addProject(res.data.project);
      setActiveProject(res.data.project);
      toast.success(`Project "${res.data.project.name}" created!`);
      setName(""); setDesc(""); setColor(COLOURS[0]);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q4 Launch"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Colour */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Colour</label>
            <div className="flex flex-wrap gap-2">
              {COLOURS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview pill */}
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-sm font-medium text-gray-700">
              {name.trim() || "Project name preview"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
