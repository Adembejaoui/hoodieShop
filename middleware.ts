import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { securityHeaders } from "./middleware/security-headers";
import { routing } from "./i18n/routing";

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Handle locale routing first
    const intlResponse = intlMiddleware(req);
    
    // Apply security headers to all responses
    const response = intlResponse || securityHeaders(req);

    // Extract locale from pathname
    const localeMatch = pathname.match(/^\/(en|fr)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : "en";

    // Check if user is blocked
    if (token?.isBlocked && !pathname.match(/\/blocked(\/|$)/) && !pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL(`/${locale}/blocked`, req.url));
    }

    // Admin routes protection - only admins can access
    if (pathname.match(/\/admin(\/|$)/) && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/unauthorized`, req.url));
    }

    // Protected dashboard routes - require authentication
    if (pathname.match(/\/dashboard(\/|$)/) && !pathname.match(/\/admin(\/|$)/) && !token) {
      return NextResponse.redirect(new URL(`/${locale}/auth`, req.url));
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // CRITICAL: Allow ALL NextAuth API routes (session, callback, signin, signout, etc.)
        if (pathname.startsWith("/api/auth/")) {
          return true;
        }
        
        // Extract locale from pathname
        const localeMatch = pathname.match(/^\/(en|fr)(\/|$)/);
        const locale = localeMatch ? localeMatch[1] : null;
        
        // Allow access to auth pages without token
        if (pathname === "/auth" || pathname === `/${locale}/auth`) {
          return true;
        }
        
        // Allow access to login/register pages
        if (pathname === "/login" || pathname === "/register" || 
            pathname === `/${locale}/login` || pathname === `/${locale}/register`) {
          return true;
        }
        
        // Allow access to blocked page
        if (pathname === "/blocked" || pathname === `/${locale}/blocked`) {
          return true;
        }
        
        // Allow access to unauthorized page
        if (pathname === "/unauthorized" || pathname === `/${locale}/unauthorized`) {
          return true;
        }
        
        // Allow access to terms page
        if (pathname === "/terms" || pathname === `/${locale}/terms`) {
          return true;
        }
        
        // Allow access to privacy page (public)
        if (pathname === "/privacy" || pathname === `/${locale}/privacy`) {
          return true;
        }
        
        // GDPR data pages require authentication
        if (pathname === "/data-export" || pathname === "/data-deletion" ||
            pathname === `/${locale}/data-export` || pathname === `/${locale}/data-deletion`) {
          return !!token;
        }

        // Allow access to home page (with or without locale)
        if (pathname === "/" || pathname === `/${locale}`) {
          return true;
        }
        
        // Allow access to about and contact pages
        if (pathname === "/about" || pathname === "/contact" ||
            pathname === `/${locale}/about` || pathname === `/${locale}/contact`) {
          return true;
        }
        
        // Allow access to shop page
        if (pathname === "/shop" || pathname === `/${locale}/shop`) {
          return true;
        }
        
        // Allow access to product pages
        if (pathname.startsWith("/product/") || pathname.match(/^\/(en|fr)\/product\//)) {
          return true;
        }
        
        // Allow access to cart and checkout pages
        if (pathname === "/cart" || pathname === "/checkout" ||
            pathname === `/${locale}/cart` || pathname === `/${locale}/checkout`) {
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
        
        // Allow access to public API routes
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
        if (pathname.startsWith("/admin") || pathname.match(/^\/(en|fr)\/admin/)) {
          return token?.role === "ADMIN";
        }
        
        // Require authentication for dashboard routes
        if (pathname.startsWith("/dashboard") || pathname.match(/^\/(en|fr)\/dashboard/)) {
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
    // Match all pathnames except for static files, api routes, etc.
    // Exclude ALL api routes from internationalization
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
