import { apiRequest } from "./client";

export const getStudyGroups = () => apiRequest("/api/collaboration/groups/");
export const createStudyGroup = (payload: Record<string, unknown>) => apiRequest("/api/collaboration/groups/", { method: "POST", body: JSON.stringify(payload) });
export const getStudyGroup = (id: string) => apiRequest(`/api/collaboration/groups/${encodeURIComponent(id)}/`);
export const updateStudyGroup = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/collaboration/groups/${encodeURIComponent(id)}/`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteStudyGroup = (id: string) => apiRequest(`/api/collaboration/groups/${encodeURIComponent(id)}/`, { method: "DELETE" });
export const getStudyGroupMessages = (groupId: string) => apiRequest(`/api/collaboration/groups/${encodeURIComponent(groupId)}/messages/`);
export const sendStudyGroupMessage = (groupId: string, payload: Record<string, unknown>) => apiRequest(`/api/collaboration/groups/${encodeURIComponent(groupId)}/messages/`, { method: "POST", body: JSON.stringify(payload) });
export const updateStudyGroupMembership = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/collaboration/groups/${encodeURIComponent(id)}/membership/`, { method: "POST", body: JSON.stringify(payload) });
export const getStudyPlans = () => apiRequest("/api/collaboration/study-plans/");
export const createStudyPlan = (payload: Record<string, unknown>) => apiRequest("/api/collaboration/study-plans/", { method: "POST", body: JSON.stringify(payload) });
export const getStudyPlan = (id: string) => apiRequest(`/api/collaboration/study-plans/${encodeURIComponent(id)}/`);
export const updateStudyPlan = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/collaboration/study-plans/${encodeURIComponent(id)}/`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteStudyPlan = (id: string) => apiRequest(`/api/collaboration/study-plans/${encodeURIComponent(id)}/`, { method: "DELETE" });
export const addStudyPlanItem = (planId: string, payload: Record<string, unknown>) => apiRequest(`/api/collaboration/study-plans/${encodeURIComponent(planId)}/items/`, { method: "POST", body: JSON.stringify(payload) });
export const toggleStudyPlanItem = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/collaboration/study-plans/items/${encodeURIComponent(id)}/toggle/`, { method: "PATCH", body: JSON.stringify(payload) });