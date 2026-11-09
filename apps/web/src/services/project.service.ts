import api from "@/lib/axios";

export interface ApiProject {
  id:          string;
  name:        string;
  description?: string | null;
  color?:       string | null;
  ownerId:      string;
  createdAt:    string;
  updatedAt:    string;
  _count?: {
    tasks:   number;
    members: number;
  };
}

export interface ProjectMemberCandidate {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  position?: string | null;
  isOnline: boolean;
}

export const projectService = {
  /** Get all projects the current user is a member of */
  getProjects() {
    return api.get<{ success: boolean; projects: ApiProject[] }>("/projects");
  },

  /** Get a single project */
  getProject(projectId: string) {
    return api.get<{ success: boolean; project: ApiProject }>(
      `/projects/${projectId}`
    );
  },

  /** Get active organization users who can be added to this project */
  getEligibleProjectMembers(projectId: string) {
    return api.get<{ success: boolean; members: ProjectMemberCandidate[] }>(
      `/projects/${projectId}/eligible-members`
    );
  },

  /** Add an organization user to a project */
  addProjectMember(projectId: string, userId: string) {
    return api.post(`/projects/${projectId}/members`, {
      userId,
      role: "member",
    });
  },

  /** Create a project (admin only) */
  createProject(payload: { name: string; description?: string; color?: string }) {
    return api.post<{ success: boolean; project: ApiProject }>("/projects", payload);
  },

  /** Update a project */
  updateProject(projectId: string, payload: { name?: string; description?: string; color?: string }) {
    return api.patch<{ success: boolean; project: ApiProject }>(
      `/projects/${projectId}`,
      payload
    );
  },

  /** Delete a project */
  deleteProject(projectId: string) {
    return api.delete(`/projects/${projectId}`);
  },
};
