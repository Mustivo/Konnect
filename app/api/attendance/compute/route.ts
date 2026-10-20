import { NextRequest, NextResponse } from "next/server";
import { computeAttendance } from "@/lib/attendance/computeAttendance";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cookieToken = request.cookies.get("konnect-access-token")?.value;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const token = cookieToken || bearerToken;

  let rawBody: any = null;
  try {
    rawBody = await request.json();
  } catch {
    // Empty body
  }

  const urlClassId = request.nextUrl.searchParams.get("classId");
  const classId = String(rawBody?.classId || rawBody?.sessionId || urlClassId || "").trim();

  if (!classId) {
    return NextResponse.json({ error: "Missing required classId parameter" }, { status: 400 });
  }

  try {
    const summary = await computeAttendance(classId, { adminToken: token || undefined });
    return NextResponse.json({
      ok: true,
      summary,
    });
  } catch (err: any) {
    console.error("[Attendance Compute] Error:", err);
    return NextResponse.json(
      { error: "Failed to compute attendance", details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
