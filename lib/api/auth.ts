import { apiJson, apiRequest } from "./client";

export type ApiRole = "ADMIN" | "TEACHER" | "LEARNER" | "STUDENT" | "admin" | "teacher" | "student" | string;
export type TokenPair = { access: string; refresh: string };
export type ApiUser = { id: string | number; email: string; name?: string; username: string; first_name: string; last_name: string; phone_number?: string | null; role: ApiRole; is_verified?: boolean; avatar?: string | null };
export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  password_confirm?: string;
  role?: ApiRole;
  full_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  student_number?: string;
};
export type TeacherRegistrationPayload = {
  full_name: string;
  email: string;
  password: string;
  full_legal_name: string;
  display_name?: string;
  phone_number?: string;
  country?: string;
  bio?: string;
  subjects_expertise?: string[];
  education_level_taught?: string;
  years_of_experience?: string;
  languages?: string[];
  current_institution?: string;
};

export async function login(email: string, password: string) {
  return apiJson<TokenPair>(await apiRequest("/api/token/", {
    method: "POST",
    auth: false,
    fallbackPaths: ["/api/auth/token/", "/api/auth/login/"],
    body: JSON.stringify({ email, password }),
  }));
}
export async function register(payload: RegisterPayload) {
  const fullName = payload.full_name || payload.name || `${payload.first_name || ""} ${payload.last_name || ""}`.trim() || "User";
  const enriched = {
    ...payload,
    full_name: fullName,
    name: fullName,
  };
  return apiJson<ApiUser>(await apiRequest("/api/auth/register/", {
    method: "POST",
    auth: false,
    fallbackPaths: ["/api/register/", "/api/auth/register/"],
    body: JSON.stringify(enriched),
  }));
}
export async function registerTeacher(payload: TeacherRegistrationPayload) {
  return apiJson<Record<string, unknown>>(await apiRequest("/api/teachers/register/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  }));
}
function userFromProfile(profile: Record<string, unknown>, email: string, role: ApiRole): ApiUser {
  const fullName = String(profile.full_name || profile.full_legal_name || profile.display_name || profile.name || email).trim();
  const [firstName, ...lastName] = fullName.split(/\s+/);
  return {
    id: String(profile.user_id || profile.id || email),
    email: String(profile.email || email),
    username: String(profile.username || email.split("@")[0]),
    first_name: String(profile.first_name || firstName || ""),
    last_name: String(profile.last_name || lastName.join(" ")),
    name: fullName,
    role,
    is_verified: Boolean(profile.is_verified || profile.verification_status === "VERIFIED"),
  };
}

async function currentUserFromRoleRoutes(email: string): Promise<ApiUser> {
  const adminResponse = await apiRequest("/api/admin/pending-users/");
  if (adminResponse.ok) {
    await adminResponse.body?.cancel();
    return userFromProfile({}, email, "SUPERADMIN");
  }
  if (adminResponse.status !== 403 && adminResponse.status !== 404 && adminResponse.status !== 405) {
    await apiJson<unknown>(adminResponse);
  }

  const teacherResponse = await apiRequest("/api/teachers/");
  if (teacherResponse.ok) {
    const payload = await apiJson<unknown>(teacherResponse);
    const profiles = Array.isArray(payload) ? payload : [];
    const profile = profiles.find((item) => {
      const record = item && typeof item === "object" ? item as Record<string, unknown> : {};
      return String(record.email || "").trim().toLowerCase() === email;
    });
    if (profile && typeof profile === "object") return userFromProfile(profile as Record<string, unknown>, email, "TEACHER");
  } else if (teacherResponse.status !== 403 && teacherResponse.status !== 404 && teacherResponse.status !== 405) {
    await apiJson<unknown>(teacherResponse);
  }

  const studentResponse = await apiRequest("/api/students/");
  if (studentResponse.ok) {
    const payload = await apiJson<unknown>(studentResponse);
    const profiles = Array.isArray(payload) ? payload : [];
    const profile = profiles.find((item) => {
      const record = item && typeof item === "object" ? item as Record<string, unknown> : {};
      return String(record.email || "").trim().toLowerCase() === email;
    });
    if (profile && typeof profile === "object") return userFromProfile(profile as Record<string, unknown>, email, "LEARNER");
  } else if (studentResponse.status !== 403 && studentResponse.status !== 404 && studentResponse.status !== 405) {
    await apiJson<unknown>(studentResponse);
  }

  throw new Error("The backend accepted your sign-in, but it did not return a profile and no matching teacher or learner profile was found.");
}

export async function currentUser(emailHint = "") {
  const normalizedHint = emailHint.trim().toLowerCase();
  if (typeof window !== "undefined" && !normalizedHint) {
    const cachedEmail = window.localStorage.getItem("konnect-user-email")?.trim().toLowerCase() || "";
    const cachedUserRaw = window.localStorage.getItem("konnect-user");
    if (cachedUserRaw) {
      try {
        const cachedUser = JSON.parse(cachedUserRaw) as ApiUser;
        if (cachedUser.email?.trim().toLowerCase() === cachedEmail) return normalizeUser(cachedUser);
      } catch {
        window.localStorage.removeItem("konnect-user");
      }
    }
    if (!normalizedHint && cachedEmail) {
      const user = await currentUserFromRoleRoutes(cachedEmail);
      window.localStorage.setItem("konnect-user", JSON.stringify(user));
      return user;
    }
  }

  if (!normalizedHint) throw new Error("Your signed-in email is unavailable. Please sign in again.");
  // The live API does not expose /api/users/me/ or /api/auth/me/. Identify
  // the account through its documented, role-protected profile routes instead.
  return currentUserFromRoleRoutes(normalizedHint);
}

function normalizeUser(user: ApiUser) {
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
export const deleteCurrentUser = () => apiRequest("/api/users/me/", { method: "DELETE", fallbackPaths: ["/api/auth/me/"] });
export async function refreshToken(refresh: string) { return apiJson<Pick<TokenPair, "access">>(await apiRequest("/api/auth/token/refresh/", { method: "POST", auth: false, fallbackPaths: ["/api/token/refresh/", "/api/auth/token/refresh/"], body: JSON.stringify({ refresh }) })); }
export const logout = (refresh: string) => apiRequest("/api/auth/logout/", { method: "POST", fallbackPaths: ["/api/logout/", "/api/auth/logout/"], body: JSON.stringify({ refresh }) });
export async function getTeacherProfile() { return apiJson<Record<string, unknown>>(await apiRequest("/api/teachers/me/", { fallbackPaths: ["/api/auth/me/teacher-profile/", "/api/teacher/profile/"] })); }
export async function getLearnerProfile() {
  const learner = await currentUser();
  return apiJson<Record<string, unknown>>(await apiRequest(`/api/students/${encodeURIComponent(String(learner.id))}/`));
}
export async function updateTeacherProfile(payload: FormData | Record<string, unknown>) { return apiJson<Record<string, unknown>>(await apiRequest("/api/teachers/me/", { method: "PATCH", fallbackPaths: ["/api/auth/me/teacher-profile/", "/api/teacher/profile/"], body: payload instanceof FormData ? payload : JSON.stringify(payload) })); }
export async function updateLearnerProfile(payload: FormData | Record<string, unknown>) { return apiJson<Record<string, unknown>>(await apiRequest("/api/auth/me/learner-profile/", { method: "PATCH", fallbackPaths: ["/api/learner/profile/", "/api/auth/me/learner-profile/"], body: payload instanceof FormData ? payload : JSON.stringify(payload) })); }
