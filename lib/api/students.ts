import { apiRequest } from "./client";

export const getClassStudentOverview = (classId: string) => apiRequest(`/api/students/class/${encodeURIComponent(classId)}/overview/`);
export const getLearnerProgressGrades = () => apiRequest("/api/students/learner/progress-grades/");
export const getStudentFlags = (query = "") => apiRequest(`/api/students/flags/${query}`);
export const createStudentFlag = (payload: Record<string, unknown>) => apiRequest("/api/students/flags/", { method: "POST", body: JSON.stringify(payload) });
export const updateStudentFlag = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/students/flags/${encodeURIComponent(id)}/`, { method: "PATCH", body: JSON.stringify(payload) });
export const getStudentBadges = () => apiRequest("/api/students/badges/");
export const getMyBadges = () => apiRequest("/api/students/badges/my-badges/");
export const awardStudentBadge = (payload: Record<string, unknown>) => apiRequest("/api/students/badges/award/", { method: "POST", body: JSON.stringify(payload) });