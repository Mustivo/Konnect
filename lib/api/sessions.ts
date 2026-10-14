import { apiRequest } from "./client";

export const getClassSessions = (classId: string, query = "") => apiRequest(`/api/sessions/class/${encodeURIComponent(classId)}/${query}`);
export const createClassSession = (classId: string, payload: Record<string, unknown>) => apiRequest(`/api/sessions/class/${encodeURIComponent(classId)}/`, { method: "POST", body: JSON.stringify(payload) });
export const getSession = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/`);
export const startSession = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/start/`, { method: "POST", body: JSON.stringify({}) });
export const joinSession = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/join/`, { method: "POST", body: JSON.stringify({}) });
export const leaveSession = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/leave/`, { method: "POST", body: JSON.stringify({}) });
export const endSession = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/end/`, { method: "POST", body: JSON.stringify({}) });
export const getSessionAttendance = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/attendance/`);
export const getSessionChat = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/chat/`);
export const sendSessionChatMessage = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/chat/`, { method: "POST", body: JSON.stringify(payload) });