import { apiJson, apiRequest } from "./client";

export type ApiRole = "ADMIN" | "TEACHER" | "LEARNER";
export type TokenPair = { access: string; refresh: string };
export type ApiUser = { id: string; email: string; username: string; first_name: string; last_name: string; phone_number?: string | null; role: ApiRole; is_verified: boolean; avatar: string | null };
export type RegisterPayload = { email: string; username: string; password: string; password_confirm: string; role: ApiRole; first_name?: string; last_name?: string; phone_number?: string };

export async function login(email: string, password: string) {
  return apiJson<TokenPair>(await apiRequest("/api/auth/login/", { method: "POST", auth: false, body: JSON.stringify({ email, password }) }));
}
export async function register(payload: RegisterPayload) {
  return apiJson<ApiUser>(await apiRequest("/api/auth/register/", { method: "POST", auth: false, body: JSON.stringify(payload) }));
}
export async function currentUser() { return apiJson<ApiUser>(await apiRequest("/api/auth/me/")); }
export async function updateCurrentUser(payload: FormData | Record<string, unknown>) {
  const user = await apiJson<ApiUser>(await apiRequest("/api/auth/me/", { method: "PATCH", body: payload instanceof FormData ? payload : JSON.stringify(payload) }));
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("konnect-user-updated", { detail: user }));
  return user;
}
export async function refreshToken(refresh: string) { return apiJson<Pick<TokenPair, "access">>(await apiRequest("/api/auth/token/refresh/", { method: "POST", auth: false, body: JSON.stringify({ refresh }) })); }
export const logout = (refresh: string) => apiRequest("/api/auth/logout/", { method: "POST", body: JSON.stringify({ refresh }) });
export async function getTeacherProfile() { return apiJson<Record<string, unknown>>(await apiRequest("/api/auth/me/teacher-profile/")); }
export async function getLearnerProfile() { return apiJson<Record<string, unknown>>(await apiRequest("/api/auth/me/learner-profile/")); }
export async function updateTeacherProfile(payload: FormData | Record<string, unknown>) { return apiJson<Record<string, unknown>>(await apiRequest("/api/auth/me/teacher-profile/", { method: "PATCH", body: payload instanceof FormData ? payload : JSON.stringify(payload) })); }
export async function updateLearnerProfile(payload: FormData | Record<string, unknown>) { return apiJson<Record<string, unknown>>(await apiRequest("/api/auth/me/learner-profile/", { method: "PATCH", body: payload instanceof FormData ? payload : JSON.stringify(payload) })); }
