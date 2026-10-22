import { apiRequest } from "./client";

// Live session and attendance records belong to the configured external API.
export async function getClassSessions(classId: string, query = "") {
  const response = await apiRequest(`/api/live-sessions/${query}`);
  const wanted = String(classId).toLowerCase();
  const filterRows = (rows: Array<Record<string, unknown>>) => rows.filter((row) => {
    const raw = row.class_room ?? row.class_id ?? row.class;
    const classValue = raw && typeof raw === "object"
      ? (raw as Record<string, unknown>).id ?? (raw as Record<string, unknown>).pk
      : raw;
    return classValue != null && String(classValue).toLowerCase() === wanted;
  });

  if (response.ok) {
    const payload = await response.json().catch(() => null) as { results?: Array<Record<string, unknown>>; sessions?: Array<Record<string, unknown>> } | Array<Record<string, unknown>> | null;
    const rows = Array.isArray(payload) ? payload : payload?.results || payload?.sessions || [];
    const results = filterRows(rows);
    if (results.length) return Response.json({ count: results.length, results });
  }

  // The local course database also keeps its own sessions for sample courses.
  const localResponse = await apiRequest(`/api/sessions/class/${encodeURIComponent(classId)}/`);
  if (localResponse.ok) return localResponse;
  return response;
}
export const createClassSession = (_classId: string, payload: Record<string, unknown>) =>
  apiRequest("/api/live-sessions/", { method: "POST", body: JSON.stringify(payload) });
export const getSession = (id: string) => apiRequest(`/api/live-sessions/${encodeURIComponent(id)}/`);
export const joinSession = (id: string, payload?: Record<string, unknown>) => apiRequest(`/api/attendance/sessions/${encodeURIComponent(id)}/join/`, { method: "POST", body: JSON.stringify(payload || {}) });
export const leaveSession = (id: string, payload?: Record<string, unknown>) => apiRequest(`/api/attendance/sessions/${encodeURIComponent(id)}/leave/`, { method: "POST", body: JSON.stringify(payload || {}) });
export const endSession = (id: string) => apiRequest(`/api/attendance/sessions/${encodeURIComponent(id)}/finalize/`, { method: "POST", body: JSON.stringify({}) });
export async function getSessionAttendance(id: string) {
  const response = await apiRequest("/api/attendance/");
  if (!response.ok) return response;
  const payload = await response.json().catch(() => null) as { results?: Array<Record<string, unknown>> } | Array<Record<string, unknown>> | null;
  const rows = Array.isArray(payload) ? payload : payload?.results || [];
  const wanted = String(id).toLowerCase();
  const results = rows.filter((row) => {
    const raw = row.session_id ?? row.live_session_id ?? row.session ?? row.live_session;
    const value = raw && typeof raw === "object"
      ? (raw as Record<string, unknown>).id ?? (raw as Record<string, unknown>).pk
      : raw;
    return value == null || String(value).toLowerCase() === wanted;
  });
  return Response.json(Array.isArray(payload) ? results : { ...(payload || {}), count: results.length, results });
}
export const getSessionChat = (id: string) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/chat/`);
export const sendSessionChatMessage = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/sessions/${encodeURIComponent(id)}/chat/`, { method: "POST", body: JSON.stringify(payload) });

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

export const getLiveSignals = (sessionId: string, participantId: string, since?: string) => {
  const query = new URLSearchParams({ participant_id: participantId });
  if (since) query.set("since", since);
  return apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/signals/?${query.toString()}`);
};

export const sendLiveSignal = (sessionId: string, participantId: string, payload: Record<string, unknown>, recipientId?: string) =>
  apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/signals/`, {
    method: "POST",
    body: JSON.stringify({ participant_id: participantId, recipient_id: recipientId, payload }),
  });
