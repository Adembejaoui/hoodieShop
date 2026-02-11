/**
 * Server-Side Authorization Utilities (Optimized)
 * 
 * Provides server-side authorization checks for API routes
 * Uses JWT token role for initial check, database for critical operations
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * User role type
 */
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'GHOST';

/**
 * Check if the current user is authenticated
 */
export async function requireAuth(): Promise<{
  success: boolean;
  response?: NextResponse;
  userId?: string;
  role?: UserRole;
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      ),
    };
  }
  
  return {
    success: true,
    userId: session.user.id,
    role: session.user.role as UserRole,
  };
}

/**
 * Check if the current user is an admin
 * Note: Uses JWT token role for performance (middleware already validated)
 * Only queries database for critical operations
 */
export async function requireAdmin(): Promise<{
  success: boolean;
  response?: NextResponse;
  userId?: string;
}> {
  const authResult = await requireAuth();
  
  if (!authResult.success) {
    return authResult;
  }
  
  // Fast path: trust JWT token role for admin check
  // This avoids an extra database query
  if (authResult.role === 'ADMIN') {
    return {
      success: true,
      userId: authResult.userId,
    };
  }
  
  // Slow path: verify from database if token role is not ADMIN
  // This is a security fallback
  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { role: true, isBlocked: true },
    });
    
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        ),
      };
    }
    
    if (user.isBlocked) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Account Blocked', message: 'Your account has been blocked' },
          { status: 403 }
        ),
      };
    }
    
    return {
      success: true,
      userId: authResult.userId,
    };
  } catch (error) {
    console.error('Admin check error:', error);
    // On database error, fallback to token-based check
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Server error during authorization' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Check if user can perform an action based on role
 * Uses token role for performance, database for critical operations
 */
export async function requireRole(requiredRoles: UserRole[]): Promise<{
  success: boolean;
  response?: NextResponse;
  userId?: string;
  userRole?: UserRole;
}> {
  const authResult = await requireAuth();
  
  if (!authResult.success) {
    return authResult;
  }
  
  // Fast path: trust JWT token
  if (authResult.role && requiredRoles.includes(authResult.role)) {
    return {
      success: true,
      userId: authResult.userId,
      userRole: authResult.role,
    };
  }
  
  // Slow path: verify from database
  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { role: true, isBlocked: true },
    });
    
    if (!user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        ),
      };
    }
    
    if (user.isBlocked) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Account Blocked' },
          { status: 403 }
        ),
      };
    }
    
    const userRole = user.role as UserRole;
    if (!requiredRoles.includes(userRole)) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Forbidden', message: `Required role: ${requiredRoles.join(' or ')}` },
          { status: 403 }
        ),
      };
    }
    
    return {
      success: true,
      userId: authResult.userId,
      userRole,
    };
  } catch (error) {
    console.error('Role check error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Server error during authorization' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Optional authentication - returns session info without requiring auth
 */
export async function getOptionalAuth(): Promise<{
  isAuthenticated: boolean;
  userId?: string;
  role?: UserRole;
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { isAuthenticated: false };
  }
  
  return {
    isAuthenticated: true,
    userId: session.user.id,
    role: session.user.role as UserRole,
  };
}

/**
 * Check if a user is blocked
 */
export async function checkIsBlocked(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isBlocked: true },
    });
    
    return user?.isBlocked || false;
  } catch (error) {
    console.error('Block check error:', error);
    return false;
  }
}
