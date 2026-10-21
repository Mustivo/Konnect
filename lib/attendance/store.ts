import { randomUUID } from "crypto";
import { ATTENDANCE_CONFIG } from "./config";

export interface AttendanceSessionRecord {
  id: string;
  class_id: string;
  user_id: string;
  device_id?: string;
  joined_at: string;
  last_seen_at: string;
  left_at: string | null;
}

export interface FinalAttendanceRecord {
  id: string;
  class_id: string;
  user_id: string;
  student_name?: string;
  status: "present" | "late" | "absent";
  duration_seconds: number;
  attendance_percent: number;
  auto_marked: boolean;
  computed_at: string;
  synced_to_backend?: boolean;
}

// Attendance is owned by the backend. This cache only keeps a single server
// process coherent while the backend finalizes attendance records.
let inMemorySessions: AttendanceSessionRecord[] = [];
let inMemoryFinalRecords: Record<string, FinalAttendanceRecord[]> = {};
let isInitialized = false;

function loadFromDisk(): void {
  isInitialized = true;
}

function saveToDisk(): void {
  // The backend persists finalized attendance. There is intentionally no
  // filesystem fallback here because it produces different data per instance.
}

function ensureInit(): void {
  if (!isInitialized) {
    loadFromDisk();
  }
}

/**
 * Records a heartbeat event (join, ping, or leave) using server time.
 * Prevents double-counting if the same user opens multiple tabs or devices.
 */
export function recordHeartbeatSession(params: {
  classId: string;
  userId: string;
  event: "join" | "ping" | "leave";
  deviceId?: string;
  serverTimestamp?: string;
}): { session: AttendanceSessionRecord; isNew: boolean } {
  ensureInit();
  const nowStr = params.serverTimestamp || new Date().toISOString();
  const nowMs = new Date(nowStr).getTime();
  const timeoutMs = ATTENDANCE_CONFIG.SESSION_TIMEOUT_SECONDS * 1000;

  const cleanClassId = params.classId.toLowerCase().trim();
  const cleanUserId = params.userId.toLowerCase().trim();

  // Find active session for this user in this class
  // Active means: left_at is null AND last_seen_at is within SESSION_TIMEOUT_SECONDS
  const activeSessionIndex = inMemorySessions.findIndex((s) => {
    if (s.class_id.toLowerCase() !== cleanClassId || s.user_id.toLowerCase() !== cleanUserId) {
      return false;
    }
    if (s.left_at !== null) return false;
    const lastSeenMs = new Date(s.last_seen_at).getTime();
    return nowMs - lastSeenMs <= timeoutMs;
  });

  if (params.event === "leave") {
    if (activeSessionIndex >= 0) {
      inMemorySessions[activeSessionIndex].left_at = nowStr;
      inMemorySessions[activeSessionIndex].last_seen_at = nowStr;
      saveToDisk();
      return { session: inMemorySessions[activeSessionIndex], isNew: false };
    }
    // No active session to leave, create a closed stub
    const stub: AttendanceSessionRecord = {
      id: `att-sess-${randomUUID()}`,
      class_id: params.classId,
      user_id: params.userId,
      device_id: params.deviceId,
      joined_at: nowStr,
      last_seen_at: nowStr,
      left_at: nowStr,
    };
    inMemorySessions.push(stub);
    saveToDisk();
    return { session: stub, isNew: false };
  }

  // Event is "join" or "ping"
  if (activeSessionIndex >= 0) {
    // Session is already active (e.g. from ping or second tab).
    // Update last_seen_at to keep the single session running without double counting.
    inMemorySessions[activeSessionIndex].last_seen_at = nowStr;
    saveToDisk();
    return { session: inMemorySessions[activeSessionIndex], isNew: false };
  }

  // No active session exists, start a new session
  const newSession: AttendanceSessionRecord = {
    id: `att-sess-${randomUUID()}`,
    class_id: params.classId,
    user_id: params.userId,
    device_id: params.deviceId,
    joined_at: nowStr,
    last_seen_at: nowStr,
    left_at: null,
  };

  inMemorySessions.push(newSession);
  saveToDisk();
  return { session: newSession, isNew: true };
}

/**
 * Returns all raw attendance sessions recorded for a given class.
 */
export function getAttendanceSessionsForClass(classId: string): AttendanceSessionRecord[] {
  ensureInit();
  const cleanId = classId.toLowerCase().trim();
  return inMemorySessions.filter((s) => s.class_id.toLowerCase() === cleanId);
}

/**
 * Returns stored final attendance records for a class.
 */
export function getFinalAttendanceRecords(classId: string): FinalAttendanceRecord[] {
  ensureInit();
  const cleanId = classId.toLowerCase().trim();
  return inMemoryFinalRecords[cleanId] || [];
}

/**
 * Saves computed final attendance records for a class.
 */
export function saveFinalAttendanceRecords(
  classId: string,
  records: FinalAttendanceRecord[]
): void {
  ensureInit();
  const cleanId = classId.toLowerCase().trim();
  inMemoryFinalRecords[cleanId] = records;
  saveToDisk();
}
