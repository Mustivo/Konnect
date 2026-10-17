import { NextRequest, NextResponse } from "next/server";
import {
  addClassToTable,
  addSessionChatMessage,
  createClassSessionRecord,
  endSessionRecord,
  enrollStudentInClass,
  getClassesTable,
  getEnrollmentsTable,
  getSessionAttendanceList,
  getSessionById,
  getSessionChatMessages,
  getSessionsTable,
  isTeacherEmail,
  joinSessionRecord,
  leaveSessionRecord,
  heartbeatSessionRecord,
  mockAssessmentSubmissions,
  mockLearnerProfile,
  registerTeacherEmail,
  startSessionRecord,
} from "@/lib/server/dbStore";
import {
  getTeacherProfileByEmail,
  isRegisteredTeacher,
  saveTeacherProfile,
} from "@/lib/server/teacherStore";

export const dynamic = "force-dynamic";

function normalizeBackendBase(url?: string): string {
  const target = url?.trim() || "https://konnect-classroomvirtual.onrender.com";
  try {
    const parsed = new URL(target);
    const sanitized = parsed.pathname.replace(/\/swagger\/?.*$/i, "").replace(/\/+$/, "");
    return `${parsed.origin}${sanitized || ""}`;
  } catch {
    return "https://konnect-classroomvirtual.onrender.com";
  }
}

const BACKEND_BASE = normalizeBackendBase(process.env.NEXT_PUBLIC_API_URL);

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function handleMockEndpoints(subpath: string, method: string, requestBody?: any) {
  const normalized = subpath.replace(/\/+$/, "");

  // 1. Learner enrolled classes
  if (normalized === "classes/learner/my-classes" || normalized.startsWith("classes/learner/my-classes/")) {
    const enrollments = getEnrollmentsTable();
    return jsonResponse({
      count: enrollments.length,
      next: null,
      previous: null,
      results: enrollments.map((item) => ({
        id: item.id,
        class_room: item.class_room,
        school_class: item.school_class,
        class_title: item.class_title,
        class_subject: item.class_subject,
        teacher_name: item.teacher_name,
        status: item.status,
        enrolled_at: item.enrolled_at,
      })),
    });
  }

  // 2. Browse classes catalog
  if (normalized === "classes/browse" || normalized.startsWith("classes/browse/")) {
    const classes = getClassesTable();
    return jsonResponse({
      count: classes.length,
      next: null,
      previous: null,
      results: classes.map((item) => ({
        id: item.id,
        numeric_id: item.numeric_id,
        title: item.title,
        name: item.name,
        description: item.description,
        subtitle: item.subtitle,
        subject: item.subject,
        category: item.category,
        grade: item.grade,
        group: item.group,
        teacher_name: item.teacher_name,
        instructor: item.instructor,
        lessons: item.lessons,
        level: item.level,
        enrolled_count: item.enrolled_count,
        max_students: item.max_students,
        banner_image: item.banner_image,
        image: item.image,
        status: item.status,
      })),
    });
  }

  // 3. Teacher classes
  if (normalized === "classes/teacher/my-classes" || normalized.startsWith("classes/teacher/my-classes/")) {
    if (method === "POST" && requestBody) {
      const created = addClassToTable(requestBody);
      return jsonResponse(created, 201);
    }
    const classes = getClassesTable().filter((item) => item.is_teacher_default || item.teacher === 1);
    return jsonResponse({
      count: classes.length,
      next: null,
      previous: null,
      results: classes.map((item) => ({
        id: item.id,
        title: item.title,
        name: item.name,
        subject: item.subject,
        description: item.description,
        grade: item.grade,
        group: item.group,
        enrolled_count: item.enrolled_count,
        start_date: item.created_at,
        join_code: item.join_code,
        status: item.status,
      })),
    });
  }

  // 4. Admin classes
  if (normalized === "classes/admin/all-classes" || normalized.startsWith("classes/admin/all-classes/")) {
    if (method === "POST" && requestBody) {
      const created = addClassToTable(requestBody);
      return jsonResponse(created, 201);
    }
    const classes = getClassesTable();
    return jsonResponse({
      count: classes.length,
      next: null,
      previous: null,
      results: classes,
    });
  }

  // 5. Learner enroll in class
  if (normalized.startsWith("classes/learner/enroll/")) {
    const classId = normalized.replace("classes/learner/enroll/", "").replace(/\/+$/, "");
    const enrollment = enrollStudentInClass(classId);
    return jsonResponse({
      detail: "Enrolled successfully",
      status: enrollment.status,
      enrollment,
    }, 201);
  }

  // 6. Join class by code
  if (normalized === "classes/learner/join-by-code") {
    const code = String(requestBody?.code || "").toUpperCase();
    const matchedClass = getClassesTable().find((c) => c.join_code.toUpperCase() === code);
    if (matchedClass) {
      const enrollment = enrollStudentInClass(matchedClass.id);
      return jsonResponse({
        detail: `Joined ${matchedClass.title} successfully!`,
        enrollment,
      }, 200);
    }
    return jsonResponse({ detail: "Invalid class code. Please check with your instructor." }, 400);
  }

  // 7. General enrollments list
  if (normalized === "enrollments") {
    if (method === "POST" && requestBody) {
      const classId = String(requestBody.school_class || requestBody.class_room || "");
      const enrollment = enrollStudentInClass(classId);
      return jsonResponse(enrollment, 201);
    }
    const enrollments = getEnrollmentsTable();
    return jsonResponse({
      count: enrollments.length,
      next: null,
      previous: null,
      results: enrollments,
    });
  }

  // 8. Assessments submissions for learner dashboard
  if (normalized === "assessments/learner/my-submissions" || normalized.startsWith("assessments/learner/my-submissions/")) {
    return jsonResponse({
      count: mockAssessmentSubmissions.length,
      next: null,
      previous: null,
      results: mockAssessmentSubmissions,
    });
  }

  // 9. Class assessments for teacher side
  if (normalized.startsWith("assessments/class/")) {
    return jsonResponse({
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: "ass-1", title: "Practice Problem Set", due_date: "2026-10-20" },
        { id: "ass-2", title: "Mid-Term Review Assessment", due_date: "2026-10-25" },
      ],
    });
  }

  // 10. Student progress grades
  if (normalized === "students/learner/progress-grades" || normalized.startsWith("students/learner/progress-grades/")) {
    return jsonResponse({
      attendance_rate: mockLearnerProfile.attendance_rate,
      attendance_percentage: mockLearnerProfile.attendance_rate,
      average_grade: mockLearnerProfile.average_grade,
      completed_courses: 0,
      active_courses: 4,
    });
  }

  // 11. Learner profile notes and learning goals
  if (
    normalized === "auth/me/learner-profile" ||
    normalized === "auth/me/learner-profile/" ||
    normalized === "learner/profile" ||
    normalized === "learner/profile/"
  ) {
    return jsonResponse(mockLearnerProfile);
  }

  // 12. Teacher profile
  if (
    normalized === "auth/me/teacher-profile" ||
    normalized === "auth/me/teacher-profile/" ||
    normalized === "teacher/profile" ||
    normalized === "teacher/profile/" ||
    normalized === "teachers/me" ||
    normalized === "teachers/me/"
  ) {
    if (method === "PATCH" || method === "POST" || method === "PUT") {
      const email = String(requestBody?.email || "current-teacher").toLowerCase();
      const saved = saveTeacherProfile(email, requestBody || {});
      return jsonResponse(saved, 200);
    }
    const teacherData = getTeacherProfileByEmail("current-teacher") || {
      bio: "Passionate educator specializing in Mathematics and Full-Stack Web Development.",
      headline: "Experienced Educator & Curriculum Designer",
      subject_specialization: "Mathematics & Computer Science",
      subjects_expertise: ["Mathematics", "Computer Science"],
      education_level_taught: "Secondary / High school",
      teaching_mode: "Live online · Small groups",
      verification_status: "VERIFIED",
      verified: true,
    };
    return jsonResponse(teacherData, 200);
  }

  // 13. Specific session join: /api/sessions/:id/join/
  if (normalized.startsWith("sessions/") && normalized.endsWith("/join")) {
    const parts = normalized.split("/");
    const sessionId = parts[1];
    const studentId = requestBody?.student_id || requestBody?.id || 1;
    const studentName = requestBody?.student_name || requestBody?.name || "Learner";
    const joinResult = joinSessionRecord(sessionId, studentId, studentName);
    return jsonResponse(joinResult, 200);
  }

  // 14. Session chat: GET & POST /api/sessions/:id/chat/
  if (normalized.startsWith("sessions/") && normalized.endsWith("/chat")) {
    const parts = normalized.split("/");
    const sessionId = parts[1];
    if (method === "POST" && requestBody) {
      const text = requestBody.message || requestBody.text || "";
      const senderName = requestBody.sender_name || "User";
      const senderId = requestBody.sender_id || 1;
      const newMsg = addSessionChatMessage(sessionId, text, senderName, senderId);
      return jsonResponse(newMsg, 201);
    }
    const messages = getSessionChatMessages(sessionId);
    return jsonResponse({
      count: messages.length,
      next: null,
      previous: null,
      results: messages,
      messages,
    });
  }

  // 15. Session start: /api/sessions/:id/start/
  if (normalized.startsWith("sessions/") && normalized.endsWith("/start")) {
    const parts = normalized.split("/");
    const sessionId = parts[1];
    const started = startSessionRecord(sessionId);
    return jsonResponse(started, 200);
  }

  // 16. Session leave: /api/sessions/:id/leave/
  if (normalized.startsWith("sessions/") && normalized.endsWith("/leave")) {
    const parts = normalized.split("/");
    const sessionId = parts[1];
    const studentId = requestBody?.student_id || requestBody?.id || 1;
    const leaveResult = leaveSessionRecord(sessionId, studentId);
    return jsonResponse(leaveResult, 200);
  }

  // 16b. Session heartbeat (alive ping): /api/sessions/:id/heartbeat/
  if (normalized.startsWith("sessions/") && normalized.endsWith("/heartbeat")) {
    const parts = normalized.split("/");
    const sessionId = parts[1];
    const studentId = requestBody?.student_id || requestBody?.id || 1;
    const heartbeatResult = heartbeatSessionRecord(sessionId, studentId);
    return jsonResponse(heartbeatResult, 200);
  }

  // 17. Session end: /api/sessions/:id/end/
  if (normalized.startsWith("sessions/") && normalized.endsWith("/end")) {
    const parts = normalized.split("/");
    const sessionId = parts[1];
    const ended = endSessionRecord(sessionId);
    return jsonResponse(ended, 200);
  }

  // 18. Session attendance: /api/sessions/:id/attendance/
  if (normalized.startsWith("sessions/") && normalized.endsWith("/attendance")) {
    const parts = normalized.split("/");
    const sessionId = parts[1];
    const attendance = getSessionAttendanceList(sessionId);
    return jsonResponse({
      count: attendance.length,
      next: null,
      previous: null,
      results: attendance,
    });
  }

  // 19. Session detail: /api/sessions/:id/
  if (normalized.startsWith("sessions/") && !normalized.includes("/class/")) {
    const parts = normalized.split("/");
    const sessionId = parts[1];
    const session = getSessionById(sessionId);
    return jsonResponse(session, 200);
  }

  // 20. Live sessions for a class: GET & POST /api/sessions/class/:classId/
  if (normalized.startsWith("sessions/class/")) {
    const classId = normalized.replace("sessions/class/", "").replace(/\/+$/, "");
    if (method === "POST" && requestBody) {
      const created = createClassSessionRecord({
        ...requestBody,
        class_room: classId,
      });
      return jsonResponse(created, 201);
    }
    const sessions = getSessionsTable().filter(
      (s) => s.class_room.toLowerCase() === classId.toLowerCase() || s.id.toLowerCase() === classId.toLowerCase()
    );
    return jsonResponse({
      count: sessions.length,
      next: null,
      previous: null,
      results: sessions,
    });
  }

  // 21. Live sessions list /api/live-sessions/
  if (normalized === "live-sessions" || normalized.startsWith("live-sessions/")) {
    if (method === "POST" && requestBody) {
      const created = createClassSessionRecord(requestBody);
      return jsonResponse(created, 201);
    }
    const sessions = getSessionsTable();
    return jsonResponse({
      count: sessions.length,
      next: null,
      previous: null,
      results: sessions,
    });
  }

  return null;
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const subpath = path.join("/");

  let parsedBody: any = null;
  let bodyBuffer: ArrayBuffer | undefined = undefined;

  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      bodyBuffer = await request.arrayBuffer();
      if (bodyBuffer && bodyBuffer.byteLength > 0) {
        const text = new TextDecoder().decode(bodyBuffer);
        parsedBody = JSON.parse(text);
      }
    } catch {
      // Body is not JSON (e.g. FormData/multipart or empty)
    }

    if (!parsedBody && (subpath.includes("teacher") || subpath.includes("profile")) && bodyBuffer) {
      try {
        const text = new TextDecoder().decode(bodyBuffer);
        const matches = [...text.matchAll(/name="([^"]+)"[\r\n]+([^\r\n-]+)/g)];
        const fields: Record<string, string> = {};
        for (const m of matches) {
          if (m[1] && m[2]) fields[m[1]] = m[2].trim();
        }
        if (Object.keys(fields).length > 0) {
          parsedBody = fields;
        }
      } catch {}
    }
  }

  // Check mock endpoints first for custom routes not present on Render backend
  const mockResult = handleMockEndpoints(subpath, request.method, parsedBody);
  if (mockResult) {
    return mockResult;
  }

  // For /api/classes/ and /api/classes/:id:
  const normalized = subpath.replace(/\/+$/, "");
  const isClassesRoot = normalized === "classes";

  if (normalized === "auth/register") {
    if (parsedBody) {
      const email = String(parsedBody.email || "user");
      const fullName = parsedBody.full_name || parsedBody.name || `${parsedBody.first_name || ""} ${parsedBody.last_name || ""}`.trim() || "Instructor";
      parsedBody.full_name = fullName;
      parsedBody.name = fullName;

      if (!parsedBody.username || parsedBody.username.length > 30 || parsedBody.username.includes("@")) {
        parsedBody.username = (email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 20) || "teacher") + "_" + Math.random().toString(36).slice(2, 6);
      }
      const encoded = new TextEncoder().encode(JSON.stringify(parsedBody));
      bodyBuffer = encoded.buffer;
    }

    if (parsedBody?.role && String(parsedBody.role).toUpperCase() === "TEACHER" && parsedBody?.email) {
      registerTeacherEmail(parsedBody.email);
      saveTeacherProfile(parsedBody.email, {
        email: parsedBody.email,
        full_legal_name: parsedBody.full_name,
        display_name: parsedBody.display_name || parsedBody.first_name || "Instructor",
        phone_number: parsedBody.phone_number,
      });
    }
  }

  // Build target URL to forward to Render backend
  const targetUrl = new URL(`/api/${subpath}/`, BACKEND_BASE);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!["host", "connection", "content-length", "origin", "referer", "expect"].includes(k)) {
      headers.set(key, value);
    }
  });
  headers.set("Accept", "application/json");

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: bodyBuffer,
      cache: "no-store",
    });

    // If backend returns 404 or backend /api/classes/ has 0 records, fall back to classes table
    if (isClassesRoot && request.method === "GET") {
      let isBackendEmpty = false;
      try {
        const cloned = response.clone();
        const json = await cloned.json();
        if (json && (json.count === 0 || (Array.isArray(json.results) && json.results.length === 0) || (Array.isArray(json) && json.length === 0))) {
          isBackendEmpty = true;
        }
      } catch {
        isBackendEmpty = true;
      }

      if (isBackendEmpty || !response.ok) {
        const classes = getClassesTable();
        return jsonResponse({
          count: classes.length,
          next: null,
          previous: null,
          results: classes.map((item) => ({
            id: item.numeric_id,
            name: item.name,
            grade: item.grade,
            teacher: item.teacher,
            description: item.description,
            created_at: item.created_at,
          })),
        });
      }
    }

    // If specific class requested e.g. /api/classes/:id/ and backend returns 404
    if (normalized.startsWith("classes/") && response.status === 404 && request.method === "GET") {
      const classId = normalized.replace("classes/", "").replace(/\/+$/, "");
      const matched = getClassesTable().find(
        (c) => String(c.id).toLowerCase() === classId.toLowerCase() || String(c.numeric_id) === classId
      );
      if (matched) {
        return jsonResponse({
          id: matched.numeric_id,
          name: matched.name,
          grade: matched.grade,
          teacher: matched.teacher,
          description: matched.description,
          created_at: matched.created_at,
        });
      }
    }

    // If teacher creates a class and backend returns 403/404, save into persistent database
    if ((isClassesRoot || normalized === "courses") && request.method === "POST" && (!response.ok || response.status === 403 || response.status === 404)) {
      const created = addClassToTable(parsedBody || {});
      return jsonResponse({
        id: created.numeric_id,
        name: created.name,
        grade: created.grade,
        teacher: created.teacher,
        description: created.description,
        created_at: created.created_at,
      }, 201);
    }

    if (normalized === "users/me" && response.ok) {
      try {
        const cloned = response.clone();
        const meJson = await cloned.json();
        if (meJson?.email && (isTeacherEmail(meJson.email) || isRegisteredTeacher(meJson.email))) {
          meJson.role = "teacher";
          const teacherProf = getTeacherProfileByEmail(meJson.email);
          if (teacherProf?.display_name) {
            meJson.name = teacherProf.display_name;
          }
          return jsonResponse(meJson, 200);
        }
      } catch {}
    }

    if (
      (normalized === "teachers/me" ||
        normalized === "auth/me/teacher-profile" ||
        normalized === "teacher/profile") &&
      (!response.ok || response.status === 403 || response.status === 404)
    ) {
      const defaultTeacher = getTeacherProfileByEmail("current-teacher") || {
        bio: "Passionate educator specializing in Mathematics and Full-Stack Web Development.",
        headline: "Experienced Educator & Curriculum Designer",
        subject_specialization: "Mathematics & Computer Science",
        subjects_expertise: ["Mathematics", "Computer Science"],
        education_level_taught: "Secondary / High school",
        teaching_mode: "Live online · Small groups",
        verification_status: "VERIFIED",
        verified: true,
      };
      return jsonResponse(defaultTeacher, 200);
    }

    const responseBody = await response.arrayBuffer();
    const responseHeaders = new Headers();
    response.headers.forEach((val, key) => {
      const k = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding", "content-length"].includes(k)) {
        responseHeaders.set(key, val);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("API Proxy Error:", error, error?.cause);

    // If backend connection fails, provide classes fallback
    if (isClassesRoot && request.method === "GET") {
      const classes = getClassesTable();
      return jsonResponse({
        count: classes.length,
        next: null,
        previous: null,
        results: classes.map((item) => ({
          id: item.numeric_id,
          name: item.name,
          grade: item.grade,
          teacher: item.teacher,
          description: item.description,
          created_at: item.created_at,
        })),
      });
    }

    return NextResponse.json(
      {
        detail: error?.message || "Backend connection error",
        cause: error?.cause?.message || String(error?.cause || ""),
      },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
