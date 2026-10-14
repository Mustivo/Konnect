import { apiRequest } from "./client";

export const browseClasses = (query = "") => apiRequest(`/api/classes/browse/${query}`);
export const getClass = (id: string) => apiRequest(`/api/classes/${encodeURIComponent(id)}/`);
export const getTeacherClasses = () => apiRequest("/api/classes/teacher/my-classes/");
export const createTeacherClass = (payload: FormData | Record<string, unknown>) => apiRequest("/api/classes/teacher/my-classes/", { method: "POST", body: payload instanceof FormData ? payload : JSON.stringify(payload) });
export const getTeacherClass = (id: string) => apiRequest(`/api/classes/teacher/my-classes/${encodeURIComponent(id)}/`);
export const updateTeacherClass = (id: string, payload: FormData | Record<string, unknown>) => apiRequest(`/api/classes/teacher/my-classes/${encodeURIComponent(id)}/`, { method: "PATCH", body: payload instanceof FormData ? payload : JSON.stringify(payload) });
export const deleteTeacherClass = (id: string) => apiRequest(`/api/classes/teacher/my-classes/${encodeURIComponent(id)}/`, { method: "DELETE" });
export const getLearnerClasses = (query = "") => apiRequest(`/api/classes/learner/my-classes/${query}`);
export const enrollInClass = (classId: string) => apiRequest(`/api/classes/learner/enroll/${encodeURIComponent(classId)}/`, { method: "POST", body: JSON.stringify({}) });
export const joinClassByCode = (code: string) => apiRequest("/api/classes/learner/join-by-code/", { method: "POST", body: JSON.stringify({ code }) });
export const submitClassRating = (payload: Record<string, unknown>) => apiRequest("/api/classes/ratings/submit/", { method: "POST", body: JSON.stringify(payload) });
export const getAdminClasses = () => apiRequest("/api/classes/admin/all-classes/");
export const createAdminClass = (payload: FormData | Record<string, unknown>) => apiRequest("/api/classes/admin/all-classes/", { method: "POST", body: payload instanceof FormData ? payload : JSON.stringify(payload) });