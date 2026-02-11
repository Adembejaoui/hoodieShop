import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Check if user is blocked
    if (token?.isBlocked && pathname !== "/blocked" && !pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/blocked", req.url));
    }

    // Admin routes protection - only admins can access
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Protected dashboard routes - require authentication
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/auth", req.url));
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
        
        // Allow access to NextAuth signin callback
        if (pathname.startsWith("/api/auth/signin")) {
          return true;
        }
        
        // Allow access to login/register pages
        if (pathname === "/login" || pathname === "/register") {
          return true;
        }
        
        // Allow access to blocked page
        if (pathname === "/blocked") {
          return true;
        }
        
        // Allow access to unauthorized page
        if (pathname === "/unauthorized") {
          return true;
        }
        
        // Allow access to terms page
        if (pathname === "/terms") {
          return true;
        }
        
        // Allow access to privacy page (public)
        if (pathname === "/privacy") {
          return true;
        }
        
        // GDPR data pages require authentication
        if (pathname === "/data-export" || pathname === "/data-deletion") {
          return !!token;
        }

        // Allow access to home page
        if (pathname === "/") {
          return true;
        }
        
        // Allow access to about and contact pages
        if (pathname === "/about" || pathname === "/contact") {
          return true;
        }
        
        // Allow access to shop page
        if (pathname === "/shop") {
          return true;
        }
        
        // Allow access to product pages
        if (pathname.startsWith("/product/")) {
          return true;
        }
        
        // Allow access to cart and checkout pages
        if (pathname === "/cart" || pathname === "/checkout") {
          return true;
        }
        
        // Allow access to public assets
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/static") ||
          pathname.startsWith("/public") ||
          pathname === "/favicon.ico"
        ) {
          return true;
        }
        
        // Allow access to public API routes (products, categories, variants, coupons, orders, gdpr)
        if (
          pathname.startsWith("/api/products") ||
          pathname.startsWith("/api/categories") ||
          pathname.startsWith("/api/variants") ||
          pathname.startsWith("/api/coupons") ||
          pathname.startsWith("/api/orders") ||
          pathname.startsWith("/api/gdpr")
        ) {
          return true;
        }
        
        // Require authentication for admin routes
        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }
        
        // Require authentication for dashboard routes
        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }
        
        // Default: require authentication
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
     * - blocked page
     * - unauthorized page
     * - privacy page
     * - home page
     * - about page
     * - contact page
     * - shop page
     * - product pages
     * - cart and checkout pages
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth routes
     */
    "/((?!auth|login|register|blocked|unauthorized|terms|privacy|about|contact|cart|checkout|shop|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
