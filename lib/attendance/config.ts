/**
 * Attendance configuration rules
 * Central definition for attendance thresholds, timeouts, and allowed status values.
 */

export type AttendanceStatus = "present" | "late" | "absent";

export const ATTENDANCE_CONFIG = {
  // Required percentage of total class duration to be marked present (75%)
  MIN_ATTENDANCE_PERCENT: 75,

  // Cutoff in minutes after scheduled start time after which a student is marked "late" (10 minutes)
  LATE_THRESHOLD_MINUTES: 10,

  // Maximum silence in seconds before an in-progress session is considered ended due to browser crash (90s)
  SESSION_TIMEOUT_SECONDS: 90,

  // Interval in seconds for client heartbeat pings (30s)
  HEARTBEAT_INTERVAL_SECONDS: 30,

  // Tab hidden pause threshold in seconds before client pauses pinging (2 minutes)
  MAX_HIDDEN_PAUSE_SECONDS: 120,

  // Grace window before class start allowing early joins (15 minutes)
  CLASS_START_GRACE_MINUTES: 15,

  // Grace window after class end allowing session wrap-up (15 minutes)
  CLASS_END_GRACE_MINUTES: 15,

  // Allowed status values mapped to backend API
  ALLOWED_STATUSES: ["present", "late", "absent"] as const,
};
