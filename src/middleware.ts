import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/** Public routes that do not require authentication. */
const PUBLIC_PATHS = ["/sign-in", "/auth", "/unauthorized"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes (UX layer only; the real
  // guard is server-side authorization + RLS).
  if (!user && !isPublicPath(pathname)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.search = "";
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
