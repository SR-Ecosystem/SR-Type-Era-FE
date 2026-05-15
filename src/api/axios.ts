import axios from "axios";

// In production (Vercel), VITE_API_URL points to the Render backend.
// In development, Vite proxies /api → localhost:5000 so baseURL stays "/api".
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("srt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes("/auth/login")) {
      localStorage.removeItem("srt_token");
      localStorage.removeItem("srt_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Admin axios (separate token) ─────────────────────────────────────────────
export const adminApi = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("srt_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes("/auth/login")) {
      localStorage.removeItem("srt_admin_token");
      localStorage.removeItem("srt_admin");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);
