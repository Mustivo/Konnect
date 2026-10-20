import { NextRequest, NextResponse } from "next/server";
import { recordHeartbeatSession } from "@/lib/attendance/store";
import {
  getBackendLiveSession,
  notifyBackendJoin,
  notifyBackendLeave,
} from "@/lib/attendance/api";
import { ATTENDANCE_CONFIG } from "@/lib/attendance/config";

export const dynamic = "force-dynamic";

/**
 * Extracts the user_id safely from the JWT token string.
 * Never trust user ID passed in request body.
 */
function extractUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);
    return payload.user_id || payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // 1. Resolve Authenticated User from Cookies or Auth Header
  const cookieToken = request.cookies.get("konnect-access-token")?.value;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: Missing authentication token" },
      { status: 401 }
    );
  }

  const userId = extractUserIdFromJwt(token);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid token payload" },
      { status: 401 }
    );
  }

  // 2. Parse Body (supports application/json AND text/plain from navigator.sendBeacon)
  let rawBody: any = null;
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      rawBody = await request.json();
    } else {
      // text/plain or raw string from sendBeacon
      const text = await request.text();
      if (text) {
        try {
          rawBody = JSON.parse(text);
        } catch {
          rawBody = { raw: text };
        }
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const classId = String(rawBody?.classId || rawBody?.class_id || rawBody?.sessionId || "").trim();
  const event = String(rawBody?.event || "").toLowerCase().trim();
  const deviceId = rawBody?.deviceId ? String(rawBody.deviceId).trim() : undefined;

  if (!classId) {
    return NextResponse.json({ error: "Missing required field: classId" }, { status: 400 });
  }

  if (event !== "join" && event !== "ping" && event !== "leave") {
    return NextResponse.json(
      { error: "Invalid event. Allowed events: join, ping, leave" },
      { status: 400 }
    );
  }

  // 3. Server Time Only
  const serverTimestamp = new Date().toISOString();
  const serverNowMs = Date.now();

  // 4. Verify Class Timing Window (Grace: 15 min early, 15 min after end)
  const sessionData = await getBackendLiveSession(classId, token);
  if (sessionData?.starts_at && sessionData?.ends_at) {
    const startMs = new Date(sessionData.starts_at).getTime();
    const endMs = new Date(sessionData.ends_at).getTime();
    const earlyGraceMs = ATTENDANCE_CONFIG.CLASS_START_GRACE_MINUTES * 60 * 1000;
    const lateGraceMs = ATTENDANCE_CONFIG.CLASS_END_GRACE_MINUTES * 60 * 1000;

    if (serverNowMs < startMs - earlyGraceMs) {
      return NextResponse.json(
        {
          error: "Class is not live yet",
          starts_at: sessionData.starts_at,
        },
        { status: 400 }
      );
    }

    if (serverNowMs > endMs + lateGraceMs) {
      return NextResponse.json(
        {
          error: "Class has already ended",
          ends_at: sessionData.ends_at,
        },
        { status: 400 }
      );
    }
  }

  // 5. In-Progress Attendance Session Storage (De-duplicates multiple tabs / devices)
  const result = recordHeartbeatSession({
    classId,
    userId,
    event,
    deviceId,
    serverTimestamp,
  });

  // 6. Forward Join/Leave to Backend API
  if (event === "join" && result.isNew) {
    void notifyBackendJoin(classId, token);
  } else if (event === "leave") {
    void notifyBackendLeave(classId, token);
  }

  return NextResponse.json({
    ok: true,
    event,
    classId,
    timestamp: serverTimestamp,
    sessionId: result.session.id,
  });
}
