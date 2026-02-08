import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes protection - only admins can access
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Protected API routes - only admins can access
    if (pathname.startsWith("/api/admin") && token?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Allow access to auth page without token
        if (pathname === "/auth" || pathname === "/api/auth") {
          return true;
        }
        
        // Allow access to login/register pages (they redirect to /auth)
        if (pathname === "/login" || pathname === "/register") {
          return true;
        }
        
        // Allow access to terms page
        if (pathname === "/terms") {
          return true;
        }
        
        // Allow access to public assets and API routes
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/static") ||
          pathname.startsWith("/public") ||
          pathname.includes("/api/auth")
        ) {
          return true;
        }
        
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - auth page
     * - login/register pages
     * - terms page
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth routes
     */
    "/((?!auth|login|register|terms|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
