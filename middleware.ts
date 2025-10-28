// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/upload-meal", "/progress"];
const PUBLIC_PATHS = ["/", "/login"];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const isProtected = PROTECTED_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Case 1: Protected route access
  if (isProtected) {
    if (!session) {
      // No session cookie, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // Session exists, allow request to continue
    return NextResponse.next();
  }

  // Case 2: User is on a public path but is already logged in (e.g., /login)
  if (PUBLIC_PATHS.includes(request.nextUrl.pathname) && session) {
    // Logged in users should be redirected from the login page to the dashboard
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Otherwise, allow the request to proceed
  return NextResponse.next();
}

// Config to only run middleware on relevant paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload-meal/:path*",
    "/progress/:path*",
    "/login",
    "/",
  ],
};
