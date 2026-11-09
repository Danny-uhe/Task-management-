import { create } from "zustand";
import { projectService } from "@/services/project.service";
import type { ApiProject } from "@/services/project.service";

interface ProjectState {
  projects: ApiProject[];
  activeProject: ApiProject | null;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  setActiveProject: (p: ApiProject | null) => void;
  addProject: (p: ApiProject) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  loading: false,

  fetchProjects: async () => {
    try {
      await get().refreshProjects();
    } catch {
      // Initial dashboard loading retains its existing non-blocking behavior.
    }
  },

  refreshProjects: async () => {
    set({ loading: true });
    try {
      const res = await projectService.getProjects();
      const projects = res.data.projects;
      set((state) => {
        const activeProject = state.activeProject;

        return {
          projects,
          // Keep activeProject in sync or default to first
          activeProject: activeProject
            ? projects.find((p) => p.id === activeProject.id) ?? projects[0] ?? null
            : projects[0] ?? null,
        };
      });
    } finally {
      set({ loading: false });
    }
  },

  setActiveProject: (p) => set({ activeProject: p }),

  addProject: (p) =>
    set((s) => ({
      projects: [p, ...s.projects],
      activeProject: s.activeProject ?? p,
    })),
}));
