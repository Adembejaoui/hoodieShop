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

    // Protected dashboard routes - require authentication
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Protected dashboard API routes - require authentication
    if (pathname.startsWith("/api/dashboard") && !token) {
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
        
        // Allow access to login/register pages
        if (pathname === "/login" || pathname === "/register") {
          return true;
        }
        
        // Allow access to terms page
        if (pathname === "/terms") {
          return true;
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
        
        // Allow access to public API routes (products, categories, variants, coupons, orders)
        if (
          pathname.startsWith("/api/products") ||
          pathname.startsWith("/api/categories") ||
          pathname.startsWith("/api/variants") ||
          pathname.startsWith("/api/coupons") ||
          pathname.startsWith("/api/orders")
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
     * - terms page
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
    "/((?!auth|login|register|terms|about|contact|cart|checkout|shop|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
