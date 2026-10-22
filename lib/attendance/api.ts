/**
 * Server-side API integration for KONNECT Virtual Classroom backend.
 * Handles timeouts and retries for Render cold starts.
 */

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://konnect-k0x2.onrender.com")
  .replace(/\/+$/, "");

const DEFAULT_TIMEOUT_MS = 12000;
const MAX_RETRIES = 3;

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // If backend is sleeping/502/503/504 on Render, retry with exponential backoff
      if ((response.status >= 502 && response.status <= 504) && attempt < retries) {
        await new Promise((r) => setTimeout(r, attempt * 1200));
        continue;
      }

      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }

  throw lastError || new Error(`Request to ${url} failed after ${retries} attempts`);
}

export interface BackendLiveSession {
  id: string;
  course: string;
  course_title: string;
  starts_at: string;
  ends_at: string;
  join_deadline?: string;
  attendance_cutoff?: string;
  join_window_open?: boolean;
}

export interface BackendEnrollment {
  id: string;
  course: string;
  student: string;
  student_username?: string;
  status?: string;
}

export interface BackendAttendanceRecord {
  id: string;
  live_session: string;
  student: string;
  student_name: string;
  student_username: string;
  status: "present" | "late" | "absent";
  joined_at: string | null;
  left_at: string | null;
  auto_marked: boolean;
  marked_at: string | null;
}

/**
 * Retrieves details of a live session from the backend API.
 */
export async function getBackendLiveSession(
  sessionId: string,
  token?: string
): Promise<BackendLiveSession | null> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetchWithRetry(`${BACKEND_BASE}/api/live-sessions/${encodeURIComponent(sessionId)}/`, {
      method: "GET",
      headers,
    });
    if (!res.ok) return null;
    return (await res.json()) as BackendLiveSession;
  } catch (err) {
    console.warn(`[Attendance API] Error fetching live session ${sessionId}:`, err);
    return null;
  }
}

/**
 * Retrieves enrolled students for a course from the backend API.
 */
export async function getBackendEnrollments(
  courseId?: string,
  token?: string
): Promise<BackendEnrollment[]> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetchWithRetry(`${BACKEND_BASE}/api/enrollments/`, {
      method: "GET",
      headers,
    });
    if (!res.ok) return [];
    const all = (await res.json()) as BackendEnrollment[];
    if (courseId) {
      const cleanCourse = courseId.toLowerCase().trim();
      return all.filter((e) => e.course?.toLowerCase().trim() === cleanCourse);
    }
    return all;
  } catch (err) {
    console.warn("[Attendance API] Error fetching enrollments:", err);
    return [];
  }
}

/**
 * Notifies the backend of a student joining the session.
 */
export async function notifyBackendJoin(
  sessionId: string,
  token: string
): Promise<boolean> {
  try {
    const res = await fetchWithRetry(
      `${BACKEND_BASE}/api/attendance/sessions/${encodeURIComponent(sessionId)}/join/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );
    return res.status === 200 || res.status === 201;
  } catch (err) {
    console.warn(`[Attendance API] Join notification failed for session ${sessionId}:`, err);
    return false;
  }
}

/**
 * Notifies the backend of a student leaving the session.
 */
export async function notifyBackendLeave(
  sessionId: string,
  token: string
): Promise<boolean> {
  try {
    const res = await fetchWithRetry(
      `${BACKEND_BASE}/api/attendance/sessions/${encodeURIComponent(sessionId)}/leave/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );
    return res.status === 200;
  } catch (err) {
    console.warn(`[Attendance API] Leave notification failed for session ${sessionId}:`, err);
    return false;
  }
}

/**
 * Calls finalize attendance endpoint on backend.
 */
export async function finalizeBackendAttendance(
  sessionId: string,
  adminToken: string
): Promise<{ detail: string; finalized_count?: number } | null> {
  try {
    const res = await fetchWithRetry(
      `${BACKEND_BASE}/api/attendance/sessions/${encodeURIComponent(sessionId)}/finalize/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[Attendance API] Finalize call failed for session ${sessionId}:`, err);
    return null;
  }
}

/**
 * Lists existing attendance records to inspect manual edits (auto_marked === false).
 */
export async function getBackendAttendanceList(
  token: string
): Promise<BackendAttendanceRecord[]> {
  try {
    const res = await fetchWithRetry(`${BACKEND_BASE}/api/attendance/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    return (await res.json()) as BackendAttendanceRecord[];
  } catch (err) {
    console.warn("[Attendance API] Error listing attendance:", err);
    return [];
  }
}
