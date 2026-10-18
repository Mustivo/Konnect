import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute =
    pathname.startsWith("/learner") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin");

  if (isDashboardRoute) {
    const token = request.cookies.get("konnect-access-token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/learner/:path*",
    "/teacher/:path*",
    "/admin/:path*",
  ],
};
