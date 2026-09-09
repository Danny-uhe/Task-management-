import api from "@/lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrgUser {
  id:             string;
  name:           string;
  email:          string;
  systemRole:     "admin" | "member";
  isActive:       boolean;
  avatar?:        string | null;
  position?:      string | null;
  points:         number;
  createdAt:      string;
}

export interface Invitation {
  id:         string;
  email:      string;
  name:       string;
  systemRole: "admin" | "member";
  status:     "PENDING" | "ACCEPTED" | "CANCELLED" | "EXPIRED";
  createdAt:  string;
  expiresAt:  string;
}

export interface InvitePayload {
  email:      string;
  name:       string;
  systemRole: "admin" | "member";
}

// ── Members (admin) API calls ─────────────────────────────────────────────────

export const membersService = {
  // Users
  listUsers() {
    return api.get<{ success: boolean; users: OrgUser[] }>("/admin/users");
  },

  makeAdmin(userId: string) {
    return api.patch(`/admin/users/${userId}/role`, { systemRole: "admin" });
  },

  makeMember(userId: string) {
    return api.patch(`/admin/users/${userId}/role`, { systemRole: "member" });
  },

  deactivate(userId: string) {
    return api.patch(`/admin/users/${userId}/deactivate`);
  },

  activate(userId: string) {
    return api.patch(`/admin/users/${userId}/activate`);
  },

  // Invitations
  listInvitations() {
    return api.get<{ success: boolean; invitations: Invitation[] }>("/invitations");
  },

  sendInvite(payload: InvitePayload) {
    return api.post<{ success: boolean; invitation: Invitation }>("/invitations", payload);
  },

  cancelInvite(inviteId: string) {
    return api.patch(`/invitations/${inviteId}/cancel`);
  },

  resendInvite(inviteId: string) {
    return api.post(`/invitations/${inviteId}/resend`);
  },
};
