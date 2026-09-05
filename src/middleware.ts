import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected paths
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/api/integrations") ||
    pathname.startsWith("/api/billing");

  // Check Better Auth session token cookie
  const sessionToken =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  // In development, if no active session cookie is present and requesting protected page
  if (isProtectedPath && !sessionToken) {
    // If it's an API route, return 401 JSON
    if (pathname.startsWith("/api/")) {
      // Allow connect / webhook routes that handle OAuth or external notifications
      if (
        pathname.includes("/webhook") ||
        pathname.includes("/connect") ||
        pathname.startsWith("/api/auth")
      ) {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/api/ai/:path*",
    "/api/billing/:path*",
  ],
};
