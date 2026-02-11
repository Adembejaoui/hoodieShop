/**
 * Security Headers Middleware
 * 
 * Adds important security headers to all responses
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which paths should have strict security headers
const sensitivePaths = ['/admin', '/dashboard', '/api/admin', '/api/dashboard'];

export function securityHeaders(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Strict Transport Security (HSTS) - Force HTTPS
  // Set for 1 year (31536000 seconds) with subdomains included
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Content Security Policy (CSP) - Prevent XSS and data injection
  // Adjust based on your actual needs
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.google.com/recaptcha/",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://www.google.com/recaptcha/",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent the page from being embedded in frames (Clickjacking protection)
  response.headers.set('X-Frame-Options', 'DENY');

  // Enable XSS protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy - Control what information is sent in the Referer header
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - Control browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Additional headers for sensitive paths
  const isSensitivePath = sensitivePaths.some((path) => pathname.startsWith(path));
  
  if (isSensitivePath) {
    // Cache-Control for sensitive pages - no caching
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

// Create a middleware function for Next.js
export default function securityMiddleware(request: NextRequest) {
  return securityHeaders(request);
}

// Helper to add security headers to any NextResponse
// Note: This is for use with NextResponse objects, not raw Response
// For NextResponse, use the middleware function directly
export function addSecurityHeadersToNextResponse(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// Generate CSP report endpoint handler
export function createCSPReportHandler() {
  return async function CSPReportHandler(request: Request) {
    // Log CSP violations (in production, send to monitoring service)
    try {
      const body = await request.json();
      console.error('CSP Violation:', JSON.stringify(body, null, 2));
      
      // In production, send to services like:
      // - Sentry
      // - Datadog
      // - Custom logging endpoint
      
      return new Response('ok', { status: 204 });
    } catch {
      return new Response('Invalid CSP report', { status: 400 });
    }
  };
}
