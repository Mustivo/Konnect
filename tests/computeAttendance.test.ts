import assert from "assert";
import {
  evaluateStudentAttendance,
  mergeIntervals,
} from "../lib/attendance/computeAttendance";
import { AttendanceSessionRecord } from "../lib/attendance/store";

console.log("==================================================================");
console.log("  Running Unit Tests for computeAttendance");
console.log("==================================================================");

const CLASS_START_MS = new Date("2026-10-19T09:00:00Z").getTime();
const CLASS_END_MS = new Date("2026-10-19T10:00:00Z").getTime(); // 60 minutes = 3600 seconds

// -----------------------------------------------------------------------------
// Test 1: Rejoin within class
// Student joins at 09:00, leaves at 09:20 (20 min = 1200s)
// Rejoins at 09:30, leaves at 10:00 (30 min = 1800s)
// Total attended: 50 min = 3000s (83.3% >= 75%) -> Status: "present"
// -----------------------------------------------------------------------------
console.log("\n[Test 1] Student Rejoin within Class Duration...");
const rejoinSessions: AttendanceSessionRecord[] = [
  {
    id: "sess-1",
    class_id: "class-1",
    user_id: "student-rejoin",
    joined_at: "2026-10-19T09:00:00Z",
    last_seen_at: "2026-10-19T09:20:00Z",
    left_at: "2026-10-19T09:20:00Z",
  },
  {
    id: "sess-2",
    class_id: "class-1",
    user_id: "student-rejoin",
    joined_at: "2026-10-19T09:30:00Z",
    last_seen_at: "2026-10-19T10:00:00Z",
    left_at: "2026-10-19T10:00:00Z",
  },
];

const res1 = evaluateStudentAttendance({
  userId: "student-rejoin",
  sessions: rejoinSessions,
  classStartMs: CLASS_START_MS,
  classEndMs: CLASS_END_MS,
});

assert.strictEqual(res1.status, "present", "Test 1 failed: Expected status to be 'present'");
assert.strictEqual(res1.attendedSeconds, 3000, "Test 1 failed: Expected 3000 seconds attended");
assert.strictEqual(res1.sessionsCount, 2, "Test 1 failed: Expected 2 sessions");
console.log("  ✓ PASS: Rejoin calculated correctly (attended: 50m / 60m, 83.3% -> present)");

// -----------------------------------------------------------------------------
// Test 2: Two devices at once (Deduplication)
// Laptop: joins 09:00, leaves 09:30 (30 min)
// Phone: joins 09:15, leaves 09:45 (30 min)
// Overlapping interval: 09:00 to 09:45 = 45 min (2700s), NOT 60 min!
// 45 / 60 = 75% -> Status: "present"
// -----------------------------------------------------------------------------
console.log("\n[Test 2] Two Devices at Once (Overlapping Sessions)...");
const twoDevicesSessions: AttendanceSessionRecord[] = [
  {
    id: "device-laptop",
    class_id: "class-1",
    user_id: "student-two-devices",
    device_id: "laptop",
    joined_at: "2026-10-19T09:00:00Z",
    last_seen_at: "2026-10-19T09:30:00Z",
    left_at: "2026-10-19T09:30:00Z",
  },
  {
    id: "device-phone",
    class_id: "class-1",
    user_id: "student-two-devices",
    device_id: "phone",
    joined_at: "2026-10-19T09:15:00Z",
    last_seen_at: "2026-10-19T09:45:00Z",
    left_at: "2026-10-19T09:45:00Z",
  },
];

const res2 = evaluateStudentAttendance({
  userId: "student-two-devices",
  sessions: twoDevicesSessions,
  classStartMs: CLASS_START_MS,
  classEndMs: CLASS_END_MS,
});

assert.strictEqual(res2.attendedSeconds, 2700, "Test 2 failed: Expected 2700 seconds (45 min), no double-counting");
assert.strictEqual(res2.attendancePercent, 75, "Test 2 failed: Expected 75% attendance");
assert.strictEqual(res2.status, "present", "Test 2 failed: Expected status to be 'present'");
console.log("  ✓ PASS: Two concurrent devices merged to single contiguous 45m block without double-counting");

// -----------------------------------------------------------------------------
// Test 3: Browser crash with no leave event
// Student joins at 09:00, last ping at 09:20:00Z, left_at is null (browser crashed)
// Crash timeout grants 90 seconds past last ping: session ends at 09:21:30Z (1290s = 21.5 min)
// 1290 / 3600 = 35.8% (< 75%) -> Status: "absent"
// -----------------------------------------------------------------------------
console.log("\n[Test 3] Browser Crash with No Leave Event...");
const crashSessions: AttendanceSessionRecord[] = [
  {
    id: "crash-sess",
    class_id: "class-1",
    user_id: "student-crash",
    joined_at: "2026-10-19T09:00:00Z",
    last_seen_at: "2026-10-19T09:20:00Z",
    left_at: null, // No leave event sent because tab crashed
  },
];

const res3 = evaluateStudentAttendance({
  userId: "student-crash",
  sessions: crashSessions,
  classStartMs: CLASS_START_MS,
  classEndMs: CLASS_END_MS,
});

assert.strictEqual(res3.attendedSeconds, 1290, "Test 3 failed: Expected 1290s (20m + 90s timeout)");
assert.strictEqual(res3.status, "absent", "Test 3 failed: Expected 'absent' due to <75% attendance");
console.log("  ✓ PASS: Crash detected; 90-second timeout applied safely (duration: 21m 30s -> absent)");

// -----------------------------------------------------------------------------
// Test 4: Late join (> 10 minutes after start)
// Class start: 09:00:00Z
// Student joins at 09:15:00Z (15 minutes late > 10m threshold)
// Stays until 10:00:00Z (45 min = 2700s, 75% of class)
// Status must be marked "late"
// -----------------------------------------------------------------------------
console.log("\n[Test 4] Late Join (> 10 minutes after class start)...");
const lateSessions: AttendanceSessionRecord[] = [
  {
    id: "late-sess",
    class_id: "class-1",
    user_id: "student-late",
    joined_at: "2026-10-19T09:15:00Z",
    last_seen_at: "2026-10-19T10:00:00Z",
    left_at: "2026-10-19T10:00:00Z",
  },
];

const res4 = evaluateStudentAttendance({
  userId: "student-late",
  sessions: lateSessions,
  classStartMs: CLASS_START_MS,
  classEndMs: CLASS_END_MS,
});

assert.strictEqual(res4.joinedLate, true, "Test 4 failed: Expected joinedLate to be true");
assert.strictEqual(res4.status, "late", "Test 4 failed: Expected status to be 'late'");
console.log("  ✓ PASS: Student joined at 09:15 (15m late) -> correctly marked 'late'");

// -----------------------------------------------------------------------------
// Test 5: Learner who never joined
// Enrolled learner with empty sessions array
// Attended seconds = 0, status: "absent"
// -----------------------------------------------------------------------------
console.log("\n[Test 5] Learner Who Never Joined...");
const res5 = evaluateStudentAttendance({
  userId: "student-never-joined",
  sessions: [],
  classStartMs: CLASS_START_MS,
  classEndMs: CLASS_END_MS,
});

assert.strictEqual(res5.attendedSeconds, 0, "Test 5 failed: Expected 0 seconds");
assert.strictEqual(res5.status, "absent", "Test 5 failed: Expected status to be 'absent'");
assert.strictEqual(res5.firstJoinedAt, null, "Test 5 failed: Expected firstJoinedAt to be null");
console.log("  ✓ PASS: Learner who never joined marked 'absent' with 0 seconds");

console.log("\n==================================================================");
console.log("  All 5 Unit Tests Passed Successfully!");
console.log("==================================================================\n");
