import { apiJson, apiRequest } from "./client";

export type ApiRole = "ADMIN" | "TEACHER" | "LEARNER" | "STUDENT" | "admin" | "teacher" | "student" | string;
export type TokenPair = { access: string; refresh: string };
export type ApiUser = { id: string | number; email: string; name?: string; username: string; first_name: string; last_name: string; phone_number?: string | null; role: ApiRole; is_verified?: boolean; avatar?: string | null };
export type RegisterPayload = { email: string; username: string; password: string; password_confirm: string; role: ApiRole; first_name?: string; last_name?: string; phone_number?: string };

export async function login(email: string, password: string) {
  return apiJson<TokenPair>(await apiRequest("/api/auth/token/", {
    method: "POST",
    auth: false,
    fallbackPaths: ["/api/auth/login/", "/api/token/"],
    body: JSON.stringify({ email, password }),
  }));
}
export async function register(payload: RegisterPayload) {
  return apiJson<ApiUser>(await apiRequest("/api/auth/register/", {
    method: "POST",
    auth: false,
    fallbackPaths: ["/api/register/", "/api/auth/register/"],
    body: JSON.stringify(payload),
  }));
}
export async function currentUser() {
  const user = await apiJson<ApiUser>(await apiRequest("/api/users/me/", { fallbackPaths: ["/api/auth/me/"] }));
  if (!user.first_name && user.name) {
    const parts = user.name.split(" ");
    user.first_name = parts[0] || "";
    user.last_name = parts.slice(1).join(" ") || "";
  }
  user.first_name = user.first_name || "";
  user.last_name = user.last_name || "";
  user.username = user.username || user.email.split("@")[0];
  return user;
}
export async function updateCurrentUser(payload: FormData | Record<string, unknown>) {
  const user = await apiJson<ApiUser>(await apiRequest("/api/users/me/", {
    method: "PATCH",
    fallbackPaths: ["/api/auth/me/"],
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  }));
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("konnect-user-updated", { detail: user }));
  return user;
}
export async function refreshToken(refresh: string) { return apiJson<Pick<TokenPair, "access">>(await apiRequest("/api/auth/token/refresh/", { method: "POST", auth: false, fallbackPaths: ["/api/token/refresh/", "/api/auth/token/refresh/"], body: JSON.stringify({ refresh }) })); }
export const logout = (refresh: string) => apiRequest("/api/auth/logout/", { method: "POST", fallbackPaths: ["/api/logout/", "/api/auth/logout/"], body: JSON.stringify({ refresh }) });
export async function getTeacherProfile() { return apiJson<Record<string, unknown>>(await apiRequest("/api/auth/me/teacher-profile/", { fallbackPaths: ["/api/teacher/profile/", "/api/auth/me/teacher-profile/"] })); }
export async function getLearnerProfile() { return apiJson<Record<string, unknown>>(await apiRequest("/api/auth/me/learner-profile/", { fallbackPaths: ["/api/learner/profile/", "/api/auth/me/learner-profile/"] })); }
export async function updateTeacherProfile(payload: FormData | Record<string, unknown>) { return apiJson<Record<string, unknown>>(await apiRequest("/api/auth/me/teacher-profile/", { method: "PATCH", fallbackPaths: ["/api/teacher/profile/", "/api/auth/me/teacher-profile/"], body: payload instanceof FormData ? payload : JSON.stringify(payload) })); }
export async function updateLearnerProfile(payload: FormData | Record<string, unknown>) { return apiJson<Record<string, unknown>>(await apiRequest("/api/auth/me/learner-profile/", { method: "PATCH", fallbackPaths: ["/api/learner/profile/", "/api/auth/me/learner-profile/"], body: payload instanceof FormData ? payload : JSON.stringify(payload) })); }