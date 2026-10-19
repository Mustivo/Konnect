/**
 * KONNECT Live API Seeding Script
 * Inserts all mocked courses and live sessions from lib/mock/classesTable.ts
 * directly into the live Render backend database tables (POST /api/courses/ & POST /api/live-sessions/).
 */

const https = require("https");
const path = require("path");
const dbPath = path.join(__dirname, "..", "data", "database.json");
const dbData = require(dbPath);
const initialClassesTable = dbData.classes || [];
const initialSessionsTable = dbData.sessions || [];

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://konnect-k0x2.onrender.com";

function request(path, options = {}) {
  const url = new URL(path, BACKEND_URL);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const bodyData = options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : null;
  if (bodyData) {
    headers["Content-Length"] = Buffer.byteLength(bodyData);
  }

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: options.method || "GET",
        headers,
      },
      (res) => {
        let buf = "";
        res.on("data", (chunk) => (buf += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(buf);
          } catch {
            parsed = buf;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on("error", reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function obtainToken(email, password) {
  const res = await request("/api/token/", {
    method: "POST",
    body: { email, password },
  });
  if (res.status === 200 && res.data?.access) {
    return res.data.access;
  }
  throw new Error(`Failed to log in with ${email} (status ${res.status}): ${JSON.stringify(res.data)}`);
}

async function main() {
  console.log("==================================================================");
  console.log("  KONNECT Backend API Seeder: Mock Data -> Live Database Tables");
  console.log("==================================================================");
  console.log(`Target API: ${BACKEND_URL}`);

  // 1. Resolve Access Token & Admin Credentials
  let token = process.env.KONNECT_TOKEN || process.argv.find((a, i, arr) => arr[i - 1] === "--token");
  const email = (process.env.KONNECT_EMAIL || process.argv.find((a, i, arr) => arr[i - 1] === "--email") || "superadmin@gmail.com").toLowerCase().trim();
  const password = process.env.KONNECT_PASSWORD || process.argv.find((a, i, arr) => arr[i - 1] === "--password") || "nono@123";

  if (!token) {
    console.log(`\n1. Authenticating as: ${email}...`);
    try {
      token = await obtainToken(email, password);
      console.log("   ✓ Access token acquired successfully!");
    } catch (err) {
      console.error(`   ✗ Authentication error: ${err.message}`);
      process.exit(1);
    }
  }

  // 2. Resolve Verified Teacher
  console.log("\n2. Finding verified teacher...");
  const teachersRes = await request("/api/teachers/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const teachers = Array.isArray(teachersRes.data) ? teachersRes.data : [];
  const verifiedTeacher = teachers.find((t) => t.id === "d9b7033e-3f63-4e22-9975-97409e840c29") || teachers.find((t) => t.verification_status === "verified") || { id: "d9b7033e-3f63-4e22-9975-97409e840c29", display_name: "Mustivo" };
  const teacherId = verifiedTeacher.id;
  console.log(`   Assigned teacher: ${verifiedTeacher?.full_name || verifiedTeacher?.display_name || "Instructor"} (ID: ${teacherId})`);

  // 3. Fetch Existing Courses
  console.log("\n3. Checking existing courses on live API...");
  const existingRes = await request("/api/courses/", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const existingCourses = Array.isArray(existingRes.data) ? existingRes.data : [];
  console.log(`   Found ${existingCourses.length} courses already in database.`);
  const existingTitles = new Set(existingCourses.map((c) => c.title?.toLowerCase().trim()));

  // 4. Insert Mock Courses
  console.log(`\n4. Inserting ${initialClassesTable.length} mock courses into /api/courses/...`);
  const insertedCourses = [];

  for (const mockCourse of initialClassesTable) {
    const titleKey = mockCourse.title.toLowerCase().trim();
    if (existingTitles.has(titleKey)) {
      const match = existingCourses.find((c) => c.title?.toLowerCase().trim() === titleKey);
      console.log(`   [EXISTS] "${mockCourse.title}" (ID: ${match.id})`);
      insertedCourses.push(match);
      continue;
    }

    const payload = {
      title: mockCourse.title,
      description: mockCourse.description || mockCourse.subtitle || "Comprehensive course covering fundamental and advanced concepts.",
      visibility: "public",
      course_limit: mockCourse.max_students || 100,
      teacher: teacherId,
    };

    const res = await request("/api/courses/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    });

    if (res.status === 201) {
      console.log(`   ✓ [CREATED] "${mockCourse.title}" (UUID: ${res.data.id})`);
      insertedCourses.push(res.data);
    } else {
      console.error(`   ✗ [ERROR] Failed to create "${mockCourse.title}" (${res.status}):`, res.data);
    }
  }

  // 4. Schedule Live Sessions
  console.log("\n4. Scheduling live sessions for courses...");
  const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  futureStart.setMinutes(0, 0, 0);

  let sessionsCreated = 0;
  for (let i = 0; i < insertedCourses.length; i++) {
    const course = insertedCourses[i];
    if (!course?.id) continue;

    const startsAt = new Date(futureStart.getTime() + i * 2 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // 1 hour session

    const sessionPayload = {
      course: course.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    };

    const sessRes = await request("/api/live-sessions/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: sessionPayload,
    });

    if (sessRes.status === 201) {
      console.log(`   ✓ [SESSION] Scheduled for "${course.title}": ${startsAt.toISOString()} (ID: ${sessRes.data.id})`);
      sessionsCreated++;
    } else {
      console.log(`   - [SESSION NOTICE] Could not schedule session for "${course.title}" (${sessRes.status}):`, sessRes.data?.detail || sessRes.data);
    }
  }

  console.log("\n==================================================================");
  console.log("  Seeding Complete!");
  console.log(`  - Courses Processed: ${insertedCourses.length}/${initialClassesTable.length}`);
  console.log(`  - Sessions Created:  ${sessionsCreated}`);
  console.log("==================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error running seeder:", err);
  process.exit(1);
});
