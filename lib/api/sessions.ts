import { apiRequest } from "./client";

export const getClassSessions = (classId: string, query = "") => apiRequest(`/api/sessions/class/${encodeURIComponent(classId)}/${query}`);
export const createClassSession = (classId: string, payload: Record<string, unknown>) => apiRequest(`/api/sessions/class/${encodeURIComponent(classId)}/`, { method: "POST", body: JSON.stringify(payload) });
export const getSession = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/`);
export const startSession = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/start/`, { method: "POST", body: JSON.stringify({}) });
export const joinSession = (id: string, payload?: Record<string, unknown>) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/join/`, { method: "POST", body: JSON.stringify(payload || {}) });
export const leaveSession = (id: string, payload?: Record<string, unknown>) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/leave/`, { method: "POST", body: JSON.stringify(payload || {}) });
export const heartbeatSession = (id: string, payload?: Record<string, unknown>) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/heartbeat/`, { method: "POST", body: JSON.stringify(payload || {}) });
export const endSession = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/end/`, { method: "POST", body: JSON.stringify({}) });
export const getSessionAttendance = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/attendance/`);
export const getSessionChat = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/chat/`);
export const sendSessionChatMessage = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/chat/`, { method: "POST", body: JSON.stringify(payload) });
export const getActiveLiveSessions = () => apiRequest("/api/live-sessions/active");
export const getLiveSessions = () => apiRequest("/api/live-sessions/");
export const updateLiveSession = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/live-sessions/${encodeURIComponent(id)}/`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteLiveSession = (id: string) => apiRequest(`/api/live-sessions/${encodeURIComponent(id)}/`, { method: "DELETE" });
export const heartbeatLiveSession = (id: string, payload: Record<string, unknown>) =>
  apiRequest(`/api/live-sessions/${encodeURIComponent(id)}/heartbeat`, { method: "POST", body: JSON.stringify(payload) });
export const endLivePresence = (id: string) =>
  apiRequest(`/api/live-sessions/${encodeURIComponent(id)}/end`, { method: "POST", body: JSON.stringify({}) });

export const getLiveJoinRequests = (sessionId = "all") =>
  apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/live-requests`);

export const requestJoinSession = (sessionId: string, payload: Record<string, unknown>) =>
  apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/live-requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const admitLiveJoinRequest = (sessionId: string, requestId: string, payload?: Record<string, unknown>) =>
  apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/live-requests/${encodeURIComponent(requestId)}/admit`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });

export const rejectLiveJoinRequest = (sessionId: string, requestId: string, payload?: Record<string, unknown>) =>
  apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/live-requests/${encodeURIComponent(requestId)}/reject`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });

export const cancelLiveJoinRequest = (sessionId: string, requestId: string) =>
  apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/live-requests/${encodeURIComponent(requestId)}/cancel`, {
    method: "POST",
    body: JSON.stringify({}),
  });
