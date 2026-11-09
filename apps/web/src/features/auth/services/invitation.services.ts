import api from "@/lib/axios";
import type { AuthUser } from "@/store/authStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InvitationDetails {
  id:         string;
  email:      string;
  name:       string;
  systemRole: "admin" | "member";
  status:     "PENDING" | "ACCEPTED" | "CANCELLED" | "EXPIRED";
  expiresAt:  string;
  invitedBy:    { name: string };
  organization: { name: string };
}

export interface AcceptInvitePayload {
  password: string;
}

export interface AcceptInviteResponse {
  success:      boolean;
  user:         AuthUser;
  accessToken:  string;
  refreshToken: string;
}

export interface CreateInvitationPayload {
  email: string;
  name: string;
  systemRole: "admin" | "member";
  projectId: string;
  role: "owner" | "admin" | "member";
}

// ── Public invitation API calls ───────────────────────────────────────────────

export const invitationService = {
  create(payload: CreateInvitationPayload) {
    return api.post<{ success: boolean; invitation: InvitationDetails }>(
      "/invitations",
      payload
    );
  },

  getByToken(token: string) {
    return api.get<{ success: boolean; invitation: InvitationDetails }>(
      `/invitations/${token}`
    );
  },

  accept(token: string, payload: AcceptInvitePayload) {
    return api.post<AcceptInviteResponse>(
      `/invitations/${token}/accept`,
      payload
    );
  },
};
