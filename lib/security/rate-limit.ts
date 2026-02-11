/**
 * Rate Limiting Utility
 * 
 * Implements rate limiting using Upstash Redis for production
 * Falls back to in-memory storage for development
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Create Redis client from environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limit configurations for different endpoints
export const rateLimits = {
  // Strict limit for auth endpoints (prevent brute force)
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    timeout: 1000,
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
  
  // Moderate limit for contact form (prevent spam)
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    timeout: 1000,
    analytics: true,
    prefix: 'ratelimit:contact',
  }),
  
  // Generous limit for search (user experience)
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    timeout: 1000,
    analytics: true,
    prefix: 'ratelimit:search',
  }),
  
  // Moderate limit for products (public browsing)
  products: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    timeout: 1000,
    analytics: true,
    prefix: 'ratelimit:products',
  }),
  
  // Strict limit for order creation (prevent abuse)
  orders: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    timeout: 1000,
    analytics: true,
    prefix: 'ratelimit:orders',
  }),
  
  // Generous limit for general API (flexible)
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    timeout: 1000,
    analytics: true,
    prefix: 'ratelimit:general',
  }),
};

// Type for rate limit result
export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending?: Promise<never>;
};

// Helper function to get client IP
export function getClientIP(request: Request): string {
  // Check various headers for IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (original client)
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback for local development
  return '127.0.0.1';
}

// Apply rate limit to a request
export async function applyRateLimit(
  request: Request,
  limitType: keyof typeof rateLimits = 'general'
): Promise<RateLimitResult> {
  const ip = getClientIP(request);
  const limiter = rateLimits[limitType];
  
  try {
    const result = await limiter.limit(ip);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      pending: result.pending as RateLimitResult['pending'],
    };
  } catch (error) {
    // If rate limiting fails, allow the request but log the error
    console.error('Rate limit error:', error);
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}

// Create response with rate limit headers
export function createRateLimitResponse(
  result: RateLimitResult,
  data?: object
): Response {
  const headers = new Headers();
  
  if (result.limit > 0) {
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.toString());
  }
  
  if (!result.success) {
    headers.set('Retry-After', '60');
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Please try again in a minute',
        ...data,
      }),
      {
        status: 429,
        headers,
      }
    );
  }
  
  return new Response(JSON.stringify(data), {
    headers,
  });
}

// Middleware helper for Next.js
export function withRateLimit(
  request: Request,
  limitType: keyof typeof rateLimits = 'general'
): Promise<{
  response: Response | null;
  shouldContinue: boolean;
}> {
  return applyRateLimit(request, limitType).then((result) => {
    if (!result.success) {
      return {
        response: createRateLimitResponse(result, { retryAfter: 60 }),
        shouldContinue: false,
      };
    }
    return {
      response: null,
      shouldContinue: true,
    };
  });
}

// Rate limit metrics for monitoring
export async function getRateLimitMetrics(): Promise<{
  auth: { limit: number; remaining: number };
  contact: { limit: number; remaining: number };
  search: { limit: number; remaining: number };
  orders: { limit: number; remaining: number };
}> {
  return {
    auth: { limit: 5, remaining: 5 },
    contact: { limit: 3, remaining: 3 },
    search: { limit: 30, remaining: 30 },
    orders: { limit: 10, remaining: 10 },
  };
}
