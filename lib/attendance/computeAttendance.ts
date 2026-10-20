import { ATTENDANCE_CONFIG, AttendanceStatus } from "./config";
import {
  AttendanceSessionRecord,
  FinalAttendanceRecord,
  getAttendanceSessionsForClass,
  saveFinalAttendanceRecords,
  getFinalAttendanceRecords,
} from "./store";
import {
  getBackendLiveSession,
  getBackendEnrollments,
  getBackendAttendanceList,
  finalizeBackendAttendance,
} from "./api";

export interface StudentAttendanceResult {
  userId: string;
  studentName?: string;
  status: AttendanceStatus;
  attendedSeconds: number;
  classDurationSeconds: number;
  attendancePercent: number;
  firstJoinedAt: string | null;
  joinedLate: boolean;
  sessionsCount: number;
  autoMarked: boolean;
  skippedManualEdit: boolean;
}

export interface ClassAttendanceComputation {
  classId: string;
  classStart: string;
  classEnd: string;
  durationSeconds: number;
  totalEnrolled: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  results: StudentAttendanceResult[];
  computedAt: string;
}

/**
 * Merges overlapping time intervals into disjoint contiguous intervals.
 * Guarantees that a student with multiple devices or tabs at once is never double-counted.
 */
export function mergeIntervals(
  intervals: Array<{ startMs: number; endMs: number }>
): Array<{ startMs: number; endMs: number }> {
  if (intervals.length === 0) return [];

  // Sort by start time
  const sorted = [...intervals].sort((a, b) => a.startMs - b.startMs);
  const merged: Array<{ startMs: number; endMs: number }> = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = merged[merged.length - 1];

    if (current.startMs <= prev.endMs) {
      // Overlapping or contiguous interval -> extend previous interval
      prev.endMs = Math.max(prev.endMs, current.endMs);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Computes attendance for a single student given their sessions and class timing.
 */
export function evaluateStudentAttendance(params: {
  userId: string;
  studentName?: string;
  sessions: AttendanceSessionRecord[];
  classStartMs: number;
  classEndMs: number;
}): StudentAttendanceResult {
  const { userId, studentName, sessions, classStartMs, classEndMs } = params;
  const timeoutMs = ATTENDANCE_CONFIG.SESSION_TIMEOUT_SECONDS * 1000;
  const lateCutoffMs = classStartMs + ATTENDANCE_CONFIG.LATE_THRESHOLD_MINUTES * 60 * 1000;
  const classDurationSeconds = Math.max(1, Math.round((classEndMs - classStartMs) / 1000));

  if (!sessions || sessions.length === 0) {
    return {
      userId,
      studentName,
      status: "absent",
      attendedSeconds: 0,
      classDurationSeconds,
      attendancePercent: 0,
      firstJoinedAt: null,
      joinedLate: false,
      sessionsCount: 0,
      autoMarked: true,
      skippedManualEdit: false,
    };
  }

  // Find earliest join time
  let earliestJoinMs = Infinity;

  // Build raw intervals accounting for 90s crash timeout
  const rawIntervals: Array<{ startMs: number; endMs: number }> = [];

  for (const s of sessions) {
    const startMs = new Date(s.joined_at).getTime();
    if (startMs < earliestJoinMs) earliestJoinMs = startMs;

    const lastSeenMs = new Date(s.last_seen_at).getTime();
    let endMs = lastSeenMs;

    if (s.left_at) {
      const leftMs = new Date(s.left_at).getTime();
      // Bounded by leave time or crash timeout
      endMs = Math.min(leftMs, lastSeenMs + timeoutMs);
    } else {
      // No explicit leave event: browser crashed or window closed
      // Grant credit up to last_seen_at + timeoutMs (90s)
      endMs = lastSeenMs + timeoutMs;
    }

    // Interval must be non-negative
    if (endMs > startMs) {
      rawIntervals.push({ startMs, endMs });
    }
  }

  // 1. Merge overlapping intervals (de-duplicate concurrent devices / tabs)
  const merged = mergeIntervals(rawIntervals);

  // 2. Clip intervals strictly to class start and end
  let totalAttendedMs = 0;
  for (const interval of merged) {
    const clippedStart = Math.max(interval.startMs, classStartMs);
    const clippedEnd = Math.min(interval.endMs, classEndMs);

    if (clippedEnd > clippedStart) {
      totalAttendedMs += clippedEnd - clippedStart;
    }
  }

  const attendedSeconds = Math.round(totalAttendedMs / 1000);
  const attendancePercent = Math.min(
    100,
    parseFloat(((attendedSeconds / classDurationSeconds) * 100).toFixed(1))
  );

  const joinedLate = earliestJoinMs > lateCutoffMs;

  // Evaluate status:
  // - present: attended at least 75% AND joined on time
  // - late: joined more than 10 minutes after start (with attendance > 0)
  // - absent: otherwise (< 75% without late or zero attendance)
  let status: AttendanceStatus = "absent";

  if (attendedSeconds > 0) {
    if (joinedLate) {
      status = "late";
    } else if (attendancePercent >= ATTENDANCE_CONFIG.MIN_ATTENDANCE_PERCENT) {
      status = "present";
    } else {
      status = "absent";
    }
  }

  return {
    userId,
    studentName,
    status,
    attendedSeconds,
    classDurationSeconds,
    attendancePercent,
    firstJoinedAt: earliestJoinMs < Infinity ? new Date(earliestJoinMs).toISOString() : null,
    joinedLate,
    sessionsCount: sessions.length,
    autoMarked: true,
    skippedManualEdit: false,
  };
}

/**
 * Computes class attendance, preserves manual instructor edits, and synchronizes.
 */
export async function computeAttendance(
  classId: string,
  options?: {
    adminToken?: string;
    overrideTiming?: { starts_at: string; ends_at: string };
    enrolledUsers?: Array<{ id: string; name?: string }>;
  }
): Promise<ClassAttendanceComputation> {
  const token = options?.adminToken;

  // 1. Resolve Class Timing
  let startsAtStr = options?.overrideTiming?.starts_at;
  let endsAtStr = options?.overrideTiming?.ends_at;
  let courseId: string | undefined;

  if (!startsAtStr || !endsAtStr) {
    const liveSession = await getBackendLiveSession(classId, token);
    if (liveSession) {
      startsAtStr = liveSession.starts_at;
      endsAtStr = liveSession.ends_at;
      courseId = liveSession.course;
    }
  }

  // Fallback timing if live session timing not found
  const now = Date.now();
  const classStartMs = startsAtStr ? new Date(startsAtStr).getTime() : now - 60 * 60 * 1000;
  const classEndMs = endsAtStr ? new Date(endsAtStr).getTime() : now;
  const durationSeconds = Math.max(1, Math.round((classEndMs - classStartMs) / 1000));

  // 2. Resolve Enrolled Learners
  let learners = options?.enrolledUsers || [];
  if (learners.length === 0 && token) {
    const enrollments = await getBackendEnrollments(courseId, token);
    learners = enrollments.map((e) => ({
      id: e.student,
      name: e.student_username || "Student",
    }));
  }

  // 3. Resolve Recorded Sessions
  const classSessions = getAttendanceSessionsForClass(classId);

  // Group sessions by user
  const sessionsByUser: Record<string, AttendanceSessionRecord[]> = {};
  for (const s of classSessions) {
    const uid = s.user_id.toLowerCase();
    if (!sessionsByUser[uid]) sessionsByUser[uid] = [];
    sessionsByUser[uid].push(s);
  }

  // Also include users who had sessions even if not in enrollment list
  const allUserIds = new Set([
    ...learners.map((l) => l.id.toLowerCase()),
    ...Object.keys(sessionsByUser),
  ]);

  // 4. Check Backend for Manual Instructor Edits (auto_marked === false)
  const manualOverrides = new Map<string, AttendanceStatus>();
  if (token) {
    try {
      const existingBackendRecords = await getBackendAttendanceList(token);
      const sessionRecords = existingBackendRecords.filter(
        (r) => r.live_session?.toLowerCase() === classId.toLowerCase()
      );
      for (const rec of sessionRecords) {
        if (rec.auto_marked === false) {
          manualOverrides.set(rec.student.toLowerCase(), rec.status);
        }
      }
    } catch {}
  }

  // 5. Evaluate Attendance per Student
  const results: StudentAttendanceResult[] = [];
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  for (const uid of Array.from(allUserIds)) {
    const learnerMeta = learners.find((l) => l.id.toLowerCase() === uid);
    const userSessions = sessionsByUser[uid] || [];

    const computed = evaluateStudentAttendance({
      userId: uid,
      studentName: learnerMeta?.name,
      sessions: userSessions,
      classStartMs,
      classEndMs,
    });

    // Check manual override
    if (manualOverrides.has(uid)) {
      computed.status = manualOverrides.get(uid)!;
      computed.autoMarked = false;
      computed.skippedManualEdit = true;
    }

    if (computed.status === "present") presentCount++;
    else if (computed.status === "late") lateCount++;
    else absentCount++;

    results.push(computed);
  }

  const computedAt = new Date().toISOString();

  // 6. Save final records locally
  const finalRecords: FinalAttendanceRecord[] = results.map((r) => ({
    id: `final-att-${classId}-${r.userId}`,
    class_id: classId,
    user_id: r.userId,
    student_name: r.studentName,
    status: r.status,
    duration_seconds: r.attendedSeconds,
    attendance_percent: r.attendancePercent,
    auto_marked: r.autoMarked,
    computed_at: computedAt,
    synced_to_backend: Boolean(token),
  }));

  saveFinalAttendanceRecords(classId, finalRecords);

  // 7. Trigger backend finalize if token provided
  if (token) {
    await finalizeBackendAttendance(classId, token).catch(() => null);
  }

  return {
    classId,
    classStart: new Date(classStartMs).toISOString(),
    classEnd: new Date(classEndMs).toISOString(),
    durationSeconds,
    totalEnrolled: allUserIds.size,
    presentCount,
    lateCount,
    absentCount,
    results,
    computedAt,
  };
}
