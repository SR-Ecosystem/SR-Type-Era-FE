import api, { adminApi } from "./axios";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data: { name: string }) => api.put("/auth/me", data),
};

// ── Competitions (user) ───────────────────────────────────────────────────────
export const competitionAPI = {
  getActive: () => api.get("/competitions"),
  getById:   (id: string) => api.get(`/competitions/${id}`),
};

// ── Results (user) ────────────────────────────────────────────────────────────
export const resultAPI = {
  submit: (data: {
    competitionId: string; wpm: number; accuracy: number;
    mistakes: number; chars: number; timeTaken: number; completed: boolean;
  }) => api.post("/results", data),
  getLeaderboard: (compId: string) => api.get(`/results/competition/${compId}`),
  getMyResults:   () => api.get("/results/me"),
};

// ── Admin Auth ────────────────────────────────────────────────────────────────
export const adminAuthAPI = {
  login: (data: { email: string; password: string }) =>
    adminApi.post("/admin/auth/login", data),
  getMe: () => adminApi.get("/admin/auth/me"),
};

// ── Admin – Dashboard ─────────────────────────────────────────────────────────
export const adminDashAPI = {
  getStats: () => adminApi.get("/admin/dashboard/stats"),
};

// ── Admin – Users ─────────────────────────────────────────────────────────────
export const adminUserAPI = {
  getAll:       (params?: { search?: string; page?: number }) =>
    adminApi.get("/admin/users", { params }),
  toggleActive: (id: string) =>
    adminApi.patch(`/admin/users/${id}/toggle-active`),
};

// ── Admin – Competitions ──────────────────────────────────────────────────────
export const adminCompAPI = {
  getAll:    (status?: string) =>
    adminApi.get("/admin/competitions", { params: status ? { status } : {} }),
  create:    (data: { name: string; paragraph: string; timeLimit: number }) =>
    adminApi.post("/admin/competitions", data),
  update:    (id: string, data: Partial<{ name: string; paragraph: string; timeLimit: number }>) =>
    adminApi.put(`/admin/competitions/${id}`, data),
  setStatus: (id: string, status: string) =>
    adminApi.patch(`/admin/competitions/${id}/status`, { status }),
  delete:    (id: string) => adminApi.delete(`/admin/competitions/${id}`),
};

// ── Admin – Results ───────────────────────────────────────────────────────────
export const adminResultAPI = {
  getAll:    (params?: { competitionId?: string; search?: string }) =>
    adminApi.get("/admin/results", { params }),
  exportCsv: (competitionId?: string) => {
    const token = localStorage.getItem("srt_admin_token");
    const qs = competitionId ? `?competitionId=${competitionId}` : "";
    return fetch(`/api/admin/results/export${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
