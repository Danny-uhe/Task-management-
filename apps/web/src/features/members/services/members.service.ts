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
  isOnline?:      boolean;
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

// ── Members API calls ─────────────────────────────────────────────────────────

export const membersService = {
  // GET /api/organisation/members — returns all users with extra fields
  listUsers() {
    return api.get<{ success: boolean; members: OrgUser[] }>("/organisation/members")
      .then((res) => ({
        ...res,
        data: { ...res.data, users: res.data.members },
      }));
  },

  // Change a user's systemRole to admin
  makeAdmin(userId: string) {
    return api.patch(`/organisation/members/${userId}/role`, { systemRole: "admin" });
  },

  // Change a user's systemRole to member
  makeMember(userId: string) {
    return api.patch(`/organisation/members/${userId}/role`, { systemRole: "member" });
  },

  // Deactivate (soft-delete) a user
  deactivate(userId: string) {
    return api.delete(`/organisation/members/${userId}`);
  },

  // Re-activate a user
  activate(userId: string) {
    return api.patch(`/organisation/members/${userId}/activate`);
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
