import fs from "fs";
import path from "path";
import {
  initialClassesTable,
  initialEnrollmentsTable,
  initialSessionsTable,
  mockAssessmentSubmissions,
  mockLearnerProfile,
  type MockClassItem,
  type MockEnrollmentItem,
  type MockSessionItem,
  type MockChatMessage,
  type MockParticipant,
} from "../mock/classesTable";

export interface DatabaseSchema {
  version: number;
  classes: MockClassItem[];
  enrollments: MockEnrollmentItem[];
  sessions: MockSessionItem[];
  attendance: Record<string, MockParticipant[]>;
  chat_messages: Record<string, MockChatMessage[]>;
  assessments: typeof mockAssessmentSubmissions;
  learner_profile: typeof mockLearnerProfile;
  seeded_at: string;
  updated_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

let memoryCache: DatabaseSchema | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("Failed to create data directory:", err);
  }
}

function getInitialDatabase(): DatabaseSchema {
  return {
    version: 1,
    classes: JSON.parse(JSON.stringify(initialClassesTable)),
    enrollments: JSON.parse(JSON.stringify(initialEnrollmentsTable)),
    sessions: JSON.parse(JSON.stringify(initialSessionsTable)),
    attendance: {
      uiux: [
        {
          id: "teacher-host",
          name: "Amara Okafor",
          role: "teacher",
          status: "active",
          joined_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          camera_on: true,
          mic_on: true,
        },
        {
          id: "1",
          name: "Student (You)",
          role: "learner",
          status: "active",
          joined_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          camera_on: true,
          mic_on: true,
        },
      ],
      react: [
        {
          id: "teacher-host",
          name: "Sarah Mitchell",
          role: "teacher",
          status: "active",
          joined_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          camera_on: true,
          mic_on: true,
        },
      ],
    },
    chat_messages: {
      uiux: [
        {
          id: "msg-init-1",
          session_id: "uiux",
          message: "Welcome everyone to today's UI/UX live design workshop!",
          text: "Welcome everyone to today's UI/UX live design workshop!",
          sender_id: 102,
          sender_name: "Amara Okafor",
          created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
        {
          id: "msg-init-2",
          session_id: "uiux",
          message: "Feel free to post questions about typography scales in the chat.",
          text: "Feel free to post questions about typography scales in the chat.",
          sender_id: 102,
          sender_name: "Amara Okafor",
          created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        },
      ],
    },
    assessments: JSON.parse(JSON.stringify(mockAssessmentSubmissions)),
    learner_profile: JSON.parse(JSON.stringify(mockLearnerProfile)),
    seeded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function loadDatabase(): DatabaseSchema {
  if (memoryCache) return memoryCache;

  ensureDataDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      memoryCache = JSON.parse(raw);
      return memoryCache!;
    }
  } catch (err) {
    console.error("Failed to read database file, re-initializing:", err);
  }

  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDataDir();
  data.updated_at = new Date().toISOString();
  memoryCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database file:", err);
  }
}

// ----------------- Classes Operations -----------------
export function getDbClasses(): MockClassItem[] {
  const db = loadDatabase();
  return db.classes;
}

export function getDbClassById(id: string | number): MockClassItem | undefined {
  const db = loadDatabase();
  const search = String(id).toLowerCase();
  return db.classes.find(
    (c) => String(c.id).toLowerCase() === search || String(c.numeric_id) === search
  );
}

export function addDbClass(payload: Partial<MockClassItem>): MockClassItem {
  const db = loadDatabase();
  const numericId = db.classes.length > 0 ? Math.max(...db.classes.map((c) => c.numeric_id || 0)) + 1 : 1;
  const name = payload.name || payload.title || `Course ${numericId}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `class-${numericId}`;

  const newClass: MockClassItem = {
    id: slug,
    numeric_id: numericId,
    name,
    title: name,
    description: payload.description || "Classroom instruction and course materials.",
    subtitle: payload.subtitle || payload.description || "Comprehensive subject study.",
    subject: payload.subject || payload.category || "General",
    category: payload.category || payload.subject || "General",
    grade: payload.grade || "Grade 10",
    group: payload.group || `Class ${String.fromCharCode(65 + (numericId % 6))}`,
    teacher: payload.teacher || 1,
    teacher_name: payload.teacher_name || payload.instructor || "Mwizerwa Stiven",
    instructor: payload.instructor || payload.teacher_name || "Mwizerwa Stiven",
    lessons: Number(payload.lessons || 10),
    level: payload.level || "Intermediate",
    enrolled_count: Number(payload.enrolled_count || 1),
    max_students: Number(payload.max_students || 30),
    schedule: payload.schedule || "Mon, Wed · 10:00–11:00",
    join_code: payload.join_code || `${slug.slice(0, 3).toUpperCase()}-${numericId}-26`,
    status: payload.status || "ACTIVE",
    banner_image: payload.banner_image || null,
    image: payload.image || "/courses/mathematics.jpg",
    is_teacher_default: true,
    progress: 0,
    created_at: new Date().toISOString(),
  };

  db.classes.unshift(newClass);
  saveDatabase(db);
  return newClass;
}

// ----------------- Enrollments Operations -----------------
export function getDbEnrollments(): MockEnrollmentItem[] {
  const db = loadDatabase();
  return db.enrollments;
}

export function enrollStudentDb(classId: string | number, studentId = 1): MockEnrollmentItem {
  const db = loadDatabase();
  const matched = getDbClassById(classId);

  const existing = db.enrollments.find(
    (e) => (e.class_room.toLowerCase() === String(classId).toLowerCase() || String(e.school_class) === String(classId)) && e.student === studentId
  );
  if (existing) return existing;

  const newEnrollment: MockEnrollmentItem = {
    id: `enr-${matched?.id || classId}-${Date.now().toString().slice(-4)}`,
    student: studentId,
    school_class: matched?.numeric_id || Number(classId) || 1,
    class_room: matched?.id || String(classId),
    class_title: matched?.title || matched?.name || "Enrolled Class",
    class_subject: matched?.subject || "General",
    teacher_name: matched?.teacher_name || "Instructor",
    status: "ENROLLED",
    enrolled_at: new Date().toISOString().split("T")[0],
  };

  db.enrollments.unshift(newEnrollment);

  if (matched) {
    matched.enrolled_count = (matched.enrolled_count || 0) + 1;
    matched.status = "ENROLLED";
  }

  saveDatabase(db);
  return newEnrollment;
}

// ----------------- Sessions Operations -----------------
export function getDbSessions(): MockSessionItem[] {
  const db = loadDatabase();
  return db.sessions;
}

export function getDbSessionById(sessionId: string): MockSessionItem {
  const db = loadDatabase();
  const cleanId = String(sessionId || "").toLowerCase();
  const matched = db.sessions.find(
    (s) => s.id.toLowerCase() === cleanId || s.class_room.toLowerCase() === cleanId
  );
  if (matched) return matched;

  // Fallback
  return {
    id: sessionId,
    class_room: sessionId,
    title: "Live Class Session",
    course_title: "Class Course",
    teacher_name: "Instructor",
    scheduled_start: new Date().toISOString(),
    scheduled_end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: "LIVE",
    meeting_url: `/learner/live_classes/waiting-room?session=${sessionId}`,
  };
}

export function createDbSession(payload: Partial<MockSessionItem>): MockSessionItem {
  const db = loadDatabase();
  const id = payload.id || `session-${Date.now().toString().slice(-6)}`;
  const title = payload.title || "Live Class Session";
  const classRoom = payload.class_room || id;

  const newSession: MockSessionItem = {
    id,
    class_room: classRoom,
    course_title: payload.course_title || payload.title || "Class Session",
    title,
    agenda: payload.agenda || "Discussion and live instructional practice.",
    teacher_name: payload.teacher_name || "Instructor",
    scheduled_start: payload.scheduled_start || new Date().toISOString(),
    scheduled_end: payload.scheduled_end || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: payload.status || "SCHEDULED",
    meeting_url: payload.meeting_url || `/learner/live_classes/waiting-room?session=${id}`,
    room_id: payload.room_id || `room-${id}`,
    host: payload.host || 1,
  };

  db.sessions.unshift(newSession);
  saveDatabase(db);
  return newSession;
}

export function startDbSession(sessionId: string): MockSessionItem {
  const db = loadDatabase();
  const session = getDbSessionById(sessionId);
  session.status = "LIVE";
  saveDatabase(db);
  return session;
}

export function endDbSession(sessionId: string): MockSessionItem {
  const db = loadDatabase();
  const session = getDbSessionById(sessionId);
  session.status = "COMPLETED";
  saveDatabase(db);
  return session;
}

// ----------------- Attendance Operations -----------------
export function getDbAttendance(sessionId: string): MockParticipant[] {
  const db = loadDatabase();
  const cleanId = String(sessionId || "").toLowerCase();
  return (
    db.attendance[cleanId] || [
      {
        id: "teacher-host",
        name: getDbSessionById(sessionId).teacher_name || "Instructor",
        role: "teacher",
        status: "active",
        joined_at: new Date().toISOString(),
        camera_on: true,
        mic_on: true,
      },
    ]
  );
}

export function recordDbAttendance(
  sessionId: string,
  studentId: string | number,
  studentName = "Learner"
): { status: string; detail: string; session: MockSessionItem } {
  const db = loadDatabase();
  const cleanId = String(sessionId || "").toLowerCase();
  const session = getDbSessionById(sessionId);
  session.status = "LIVE";

  enrollStudentDb(session.class_room, Number(studentId) || 1);

  const participants = db.attendance[cleanId] || [];
  const existing = participants.find((p) => p.id === String(studentId));
  if (!existing) {
    participants.push({
      id: String(studentId),
      name: studentName,
      role: "learner",
      status: "active",
      joined_at: new Date().toISOString(),
      camera_on: true,
      mic_on: true,
    });
    db.attendance[cleanId] = participants;
    saveDatabase(db);
  }

  return {
    status: "admitted",
    detail: "Joined successfully",
    session,
  };
}

export function recordDbAttendanceLeave(
  sessionId: string,
  studentId: string | number
): { status: string; detail: string; participant?: MockParticipant } {
  const db = loadDatabase();
  const cleanId = String(sessionId || "").toLowerCase();
  const participants = db.attendance[cleanId] || [];
  const participant = participants.find((p) => String(p.id) === String(studentId));

  if (!participant) {
    return { status: "not_found", detail: "Participant not found in session attendance" };
  }

  const now = new Date();
  participant.left_at = now.toISOString();
  participant.status = "left";

  const joinTime = new Date(participant.joined_at).getTime();
  const durationMs = Math.max(0, now.getTime() - joinTime);
  const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
  participant.duration_minutes = durationMinutes;

  const session = getDbSessionById(sessionId);
  let classDurationMinutes = 60;
  if (session?.scheduled_start && session?.scheduled_end) {
    const start = new Date(session.scheduled_start).getTime();
    const end = new Date(session.scheduled_end).getTime();
    if (end > start) {
      classDurationMinutes = Math.max(1, Math.round((end - start) / 60000));
    }
  }

  const attendancePct = Math.min(100, Math.round((durationMinutes / classDurationMinutes) * 100));
  participant.attendance_pct = attendancePct;

  if (attendancePct >= 60) {
    participant.attendance_status = "Present";
  } else if (attendancePct >= 20) {
    participant.attendance_status = "Late";
  } else {
    participant.attendance_status = "Absent";
  }

  db.attendance[cleanId] = participants;
  saveDatabase(db);

  return {
    status: "left",
    detail: `Recorded leave. Duration: ${durationMinutes} mins (${attendancePct}% attendance - ${participant.attendance_status})`,
    participant,
  };
}

export function recordDbAttendanceHeartbeat(
  sessionId: string,
  studentId: string | number
): { status: string; alive_duration_minutes: number; participant?: MockParticipant } {
  const db = loadDatabase();
  const cleanId = String(sessionId || "").toLowerCase();
  const participants = db.attendance[cleanId] || [];
  const participant = participants.find((p) => String(p.id) === String(studentId));

  if (!participant) {
    return { status: "not_found", alive_duration_minutes: 0 };
  }

  const now = new Date();
  participant.last_alive_at = now.toISOString();
  participant.status = "active";

  const joinTime = new Date(participant.joined_at).getTime();
  const durationMinutes = Math.max(1, Math.round((now.getTime() - joinTime) / 60000));
  participant.duration_minutes = durationMinutes;

  db.attendance[cleanId] = participants;
  saveDatabase(db);

  return { status: "alive", alive_duration_minutes: durationMinutes, participant };
}

// ----------------- Chat Operations -----------------
export function getDbChats(sessionId: string): MockChatMessage[] {
  const db = loadDatabase();
  const cleanId = String(sessionId || "").toLowerCase();
  return db.chat_messages[cleanId] || [];
}

export function addDbChat(
  sessionId: string,
  message: string,
  senderName = "User",
  senderId: string | number = 1
): MockChatMessage {
  const db = loadDatabase();
  const cleanId = String(sessionId || "").toLowerCase();
  const chats = db.chat_messages[cleanId] || [];

  const newMsg: MockChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    session_id: cleanId,
    message,
    text: message,
    sender_id: senderId,
    sender_name: senderName,
    created_at: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };

  chats.push(newMsg);
  db.chat_messages[cleanId] = chats;
  saveDatabase(db);
  return newMsg;
}

// ----------------- Assessments & Profile -----------------
export function getDbAssessments(): typeof mockAssessmentSubmissions {
  const db = loadDatabase();
  return db.assessments;
}

export function getDbLearnerProfile(): typeof mockLearnerProfile {
  const db = loadDatabase();
  return db.learner_profile;
}

// ----------------- Compatibility Aliases -----------------
export const getClassesTable = getDbClasses;
export const addClassToTable = addDbClass;
export const getEnrollmentsTable = getDbEnrollments;
export const enrollStudentInClass = enrollStudentDb;
export const getSessionsTable = getDbSessions;
export const getSessionById = getDbSessionById;
export const createClassSessionRecord = createDbSession;
export const joinSessionRecord = recordDbAttendance;
export const leaveSessionRecord = recordDbAttendanceLeave;
export const heartbeatSessionRecord = recordDbAttendanceHeartbeat;
export const startSessionRecord = startDbSession;
export const endSessionRecord = endDbSession;
export const getSessionChatMessages = getDbChats;
export const addSessionChatMessage = addDbChat;
export const getSessionAttendanceList = getDbAttendance;

const teacherEmails = new Set<string>();
export function registerTeacherEmail(email: string) {
  if (email) teacherEmails.add(email.trim().toLowerCase());
}
export function isTeacherEmail(email: string): boolean {
  if (!email) return false;
  return teacherEmails.has(email.trim().toLowerCase());
}

export { mockAssessmentSubmissions, mockLearnerProfile };
