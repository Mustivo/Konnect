import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBackendBase(): string {
  const configured = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!configured) throw new Error("API_URL is not configured");

  const url = new URL(configured);
  url.pathname = url.pathname
    .replace(/\/(swagger|api\/docs|docs|api)\/?.*$/i, "")
    .replace(/\/+$/, "") || "/";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

const REQUEST_HEADERS_TO_SKIP = new Set([
  "host", "connection", "content-length", "cookie", "expect", "origin", "referer",
]);
const RESPONSE_HEADERS_TO_SKIP = new Set([
  "connection", "content-encoding", "content-length", "keep-alive", "transfer-encoding",
]);

function buildHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!REQUEST_HEADERS_TO_SKIP.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("Accept", "application/json");
  return headers;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const subpath = path.map(encodeURIComponent).join("/");

  let target: URL;
  try {
    target = new URL(`/api/${subpath}/`, getBackendBase());
  } catch (error) {
    console.error("API proxy configuration error:", error);
    return NextResponse.json({ detail: "The API service is not configured." }, { status: 503 });
  }
  target.search = request.nextUrl.search;

  try {
    const response = await fetch(target, {
      method: request.method,
      headers: buildHeaders(request),
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });

    const headers = new Headers();
    response.headers.forEach((value, key) => {
      if (!RESPONSE_HEADERS_TO_SKIP.has(key.toLowerCase())) headers.set(key, value);
    });

    return new NextResponse(await response.arrayBuffer(), { status: response.status, headers });
  } catch (error) {
    console.error("API proxy request failed:", error);
    return NextResponse.json(
      { detail: "The API service is temporarily unavailable. Please try again shortly." },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
