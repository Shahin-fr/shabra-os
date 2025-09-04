import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { logger } from '@/lib/logger';

export interface AuthContext {
  userId: string;
  roles: string[];
  userEmail: string;
}

export interface AuthorizationOptions {
  requiredRoles?: string[];
  requiredPrivilegeLevel?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  allowOwnResource?: boolean; // Allow users to access their own resources
  resourceOwnerField?: string; // Field to check for resource ownership
}

/**
 * Authorization middleware for API routes
 * Provides role-based access control and resource ownership validation
 */
export async function withAuth(
  request: NextRequest,
  options: AuthorizationOptions = {}
): Promise<{ context: AuthContext; response?: NextResponse }> {
  try {
    // Get user session
    const session = await auth();

    if (!session?.user?.id || !session?.user?.roles) {
      return {
        context: { userId: '', roles: [], userEmail: '' },
        response: NextResponse.json(
          { error: 'احراز هویت الزامی است', code: 'UNAUTHORIZED' },
          { status: 401 }
        ),
      };
    }

    const context: AuthContext = {
      userId: session.user.id,
      roles: session.user.roles,
      userEmail: session.user.email || '',
    };

    // Check required roles if specified
    if (options.requiredRoles && options.requiredRoles.length > 0) {
      const hasRequiredRole = options.requiredRoles.some(role =>
        context.roles.includes(role)
      );

      if (!hasRequiredRole) {
        return {
          context,
          response: NextResponse.json(
            {
              error: 'دسترسی غیرمجاز',
              code: 'INSUFFICIENT_PERMISSIONS',
              requiredRoles: options.requiredRoles,
              roles: context.roles,
            },
            { status: 403 }
          ),
        };
      }
    }

    // Check required privilege level if specified
    if (options.requiredPrivilegeLevel) {
      const privilegeHierarchy = {
        ADMIN: 3,
        MANAGER: 2,
        EMPLOYEE: 1,
      };

      const userHighestPrivilege = Math.max(
        ...context.roles.map(
          role =>
            privilegeHierarchy[role as keyof typeof privilegeHierarchy] || 0
        )
      );

      const requiredPrivilege =
        privilegeHierarchy[options.requiredPrivilegeLevel];

      if (userHighestPrivilege < requiredPrivilege) {
        return {
          context,
          response: NextResponse.json(
            {
              error: 'سطح دسترسی کافی نیست',
              code: 'INSUFFICIENT_PRIVILEGE_LEVEL',
              requiredLevel: options.requiredPrivilegeLevel,
              userHighestLevel: Object.keys(privilegeHierarchy).find(
                key =>
                  privilegeHierarchy[key as keyof typeof privilegeHierarchy] ===
                  userHighestPrivilege
              ),
            },
            { status: 403 }
          ),
        };
      }
    }

    // Check resource ownership if specified
    if (options.allowOwnResource && options.resourceOwnerField) {
      const resourceOwnerId = request.nextUrl.searchParams.get(
        options.resourceOwnerField
      );

      if (resourceOwnerId && resourceOwnerId !== context.userId) {
        // Check if user has admin or manager privileges to access other resources
        const hasElevatedPrivileges =
          context.roles.includes('ADMIN') || context.roles.includes('MANAGER');

        if (!hasElevatedPrivileges) {
          return {
            context,
            response: NextResponse.json(
              {
                error: 'دسترسی به منابع دیگران غیرمجاز است',
                code: 'RESOURCE_OWNERSHIP_VIOLATION',
                resourceOwnerId,
                userId: context.userId,
              },
              { status: 403 }
            ),
          };
        }
      }
    }

    // Log successful authorization
    logger.info('Authorization successful', {
      userId: context.userId,
      userEmail: context.userEmail,
      roles: context.roles,
      endpoint: request.nextUrl.pathname,
      method: request.method,
    });

    return { context };
  } catch (error) {
    logger.error('Authorization error', error as Error, {
      endpoint: request.nextUrl.pathname,
      method: request.method,
    });

    return {
      context: { userId: '', roles: [], userEmail: '' },
      response: NextResponse.json(
        { error: 'خطا در احراز هویت', code: 'AUTH_ERROR' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Simple role-based authorization check
 * Returns true if user has any of the required roles
 */
export async function hasRole(requiredRoles: string[]): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.roles) return false;

    return requiredRoles.some(role => session.user.roles.includes(role));
  } catch {
    return false;
  }
}

/**
 * Check if user has admin privileges
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(['ADMIN']);
}

/**
 * Check if user has manager or admin privileges
 */
export async function isManagerOrAdmin(): Promise<boolean> {
  return hasRole(['ADMIN', 'MANAGER']);
}

/**
 * Extract user context from request headers (for internal API calls)
 */
export function extractUserContext(request: NextRequest): AuthContext | null {
  try {
    const userId = request.headers.get('x-user-id');
    const roles = request.headers.get('x-user-roles');

    if (!userId || !roles) {
      return null;
    }

    return {
      userId,
      roles: JSON.parse(roles),
      userEmail: request.headers.get('x-user-email') || '',
    };
  } catch {
    return null;
  }
}

/**
 * Simple authentication middleware for API routes
 * Returns success status and user context
 */
export async function authMiddleware(request: NextRequest): Promise<{ success: boolean; context?: AuthContext }> {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.roles) {
      return { success: false };
    }

    const context: AuthContext = {
      userId: session.user.id,
      roles: session.user.roles,
      userEmail: session.user.email || '',
    };

    return { success: true, context };
  } catch (error) {
    logger.error('Authentication error', error as Error, {
      endpoint: request.nextUrl.pathname,
      method: request.method,
    });

    return { success: false };
  }
}
