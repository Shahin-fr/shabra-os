/**
 * Comprehensive Authorization Utilities
 * Provides centralized, reusable authorization functions for API routes
 */

import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

export interface AuthorizationResult {
  authorized: boolean;
  message?: string;
  statusCode?: number;
}

export interface RoleHierarchy {
  ADMIN: number;
  MANAGER: number;
  EMPLOYEE: number;
}

// Define role hierarchy for privilege level checking
const ROLE_HIERARCHY: RoleHierarchy = {
  ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

/**
 * Higher-order function for role-based authorization
 * @param requiredRole - Single role or array of roles that are allowed
 * @returns Function that checks authorization against a session
 */
export function withAuthorization(requiredRole: string | string[]) {
  return async (session: Session | null): Promise<AuthorizationResult> => {
    // Check if session exists and has user data
    if (!session?.user?.id) {
      return {
        authorized: false,
        message: 'Authentication required',
        statusCode: 401,
      };
    }

    // Check if user has roles
    const userRoles = (session.user as any).roles || [];
    if (!Array.isArray(userRoles) || userRoles.length === 0) {
      return {
        authorized: false,
        message: 'User roles not found',
        statusCode: 403,
      };
    }

    // Normalize required roles to array
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return {
        authorized: false,
        message: `Access denied. Required roles: ${requiredRoles.join(', ')}. User roles: ${userRoles.join(', ')}`,
        statusCode: 403,
      };
    }

    return {
      authorized: true,
    };
  };
}

/**
 * Higher-order function for privilege level authorization
 * @param requiredLevel - Minimum privilege level required
 * @returns Function that checks authorization against a session
 */
export function withPrivilegeLevel(requiredLevel: keyof RoleHierarchy) {
  return async (session: Session | null): Promise<AuthorizationResult> => {
    // Check if session exists and has user data
    if (!session?.user?.id) {
      return {
        authorized: false,
        message: 'Authentication required',
        statusCode: 401,
      };
    }

    // Check if user has roles
    const userRoles = (session.user as any).roles || [];
    if (!Array.isArray(userRoles) || userRoles.length === 0) {
      return {
        authorized: false,
        message: 'User roles not found',
        statusCode: 403,
      };
    }

    // Find the highest privilege level the user has
    const userHighestLevel = Math.max(
      ...userRoles.map((role: string) => ROLE_HIERARCHY[role as keyof RoleHierarchy] || 0)
    );

    const requiredLevelValue = ROLE_HIERARCHY[requiredLevel];

    if (userHighestLevel < requiredLevelValue) {
      const userLevelName = Object.keys(ROLE_HIERARCHY).find(
        key => ROLE_HIERARCHY[key as keyof RoleHierarchy] === userHighestLevel
      ) || 'NONE';

      return {
        authorized: false,
        message: `Insufficient privileges. Required: ${requiredLevel}, User has: ${userLevelName}`,
        statusCode: 403,
      };
    }

    return {
      authorized: true,
    };
  };
}

/**
 * Higher-order function for resource ownership authorization
 * @param resourceOwnerId - ID of the resource owner
 * @param allowAdmins - Whether admins can access any resource (default: true)
 * @param allowManagers - Whether managers can access any resource (default: false)
 * @returns Function that checks authorization against a session
 */
export function withResourceOwnership(
  resourceOwnerId: string,
  allowAdmins: boolean = true,
  allowManagers: boolean = false
) {
  return async (session: Session | null): Promise<AuthorizationResult> => {
    // Check if session exists and has user data
    if (!session?.user?.id) {
      return {
        authorized: false,
        message: 'Authentication required',
        statusCode: 401,
      };
    }

    const userId = session.user.id;
    const userRoles = (session.user as any).roles || [];

    // Check if user is the resource owner
    if (userId === resourceOwnerId) {
      return {
        authorized: true,
      };
    }

    // Check if user has admin privileges and admins are allowed
    if (allowAdmins && userRoles.includes('ADMIN')) {
      return {
        authorized: true,
      };
    }

    // Check if user has manager privileges and managers are allowed
    if (allowManagers && userRoles.includes('MANAGER')) {
      return {
        authorized: true,
      };
    }

    return {
      authorized: false,
      message: 'Access denied. You can only access your own resources.',
      statusCode: 403,
    };
  };
}

/**
 * Combined authorization function that checks multiple conditions
 * @param options - Authorization options
 * @returns Function that checks authorization against a session
 */
export function withCombinedAuthorization(options: {
  requiredRoles?: string | string[];
  requiredPrivilegeLevel?: keyof RoleHierarchy;
  resourceOwnerId?: string;
  allowAdmins?: boolean;
  allowManagers?: boolean;
}) {
  return async (session: Session | null): Promise<AuthorizationResult> => {
    // Check if session exists and has user data
    if (!session?.user?.id) {
      return {
        authorized: false,
        message: 'Authentication required',
        statusCode: 401,
      };
    }

    // const userRoles = (session.user as any).roles || [];
    // const userId = session.user.id;

    // Check role-based authorization
    if (options.requiredRoles) {
      const roleCheck = await withAuthorization(options.requiredRoles)(session);
      if (!roleCheck.authorized) {
        return roleCheck;
      }
    }

    // Check privilege level authorization
    if (options.requiredPrivilegeLevel) {
      const privilegeCheck = await withPrivilegeLevel(options.requiredPrivilegeLevel)(session);
      if (!privilegeCheck.authorized) {
        return privilegeCheck;
      }
    }

    // Check resource ownership authorization
    if (options.resourceOwnerId) {
      const ownershipCheck = await withResourceOwnership(
        options.resourceOwnerId,
        options.allowAdmins,
        options.allowManagers
      )(session);
      if (!ownershipCheck.authorized) {
        return ownershipCheck;
      }
    }

    return {
      authorized: true,
    };
  };
}

/**
 * Utility function to create a standardized authorization error response
 * @param result - Authorization result
 * @returns NextResponse with appropriate error
 */
export function createAuthorizationErrorResponse(result: AuthorizationResult): NextResponse {
  return NextResponse.json(
    {
      error: result.message || 'Access denied',
      code: 'AUTHORIZATION_ERROR',
    },
    { status: result.statusCode || 403 }
  );
}

/**
 * Utility function to check if user has specific role
 * @param session - User session
 * @param role - Role to check
 * @returns Boolean indicating if user has the role
 */
export function hasRole(session: Session | null, role: string): boolean {
  if (!session?.user) return false;
  const userRoles = (session.user as any).roles || [];
  return userRoles.includes(role);
}

/**
 * Utility function to check if user has any of the specified roles
 * @param session - User session
 * @param roles - Array of roles to check
 * @returns Boolean indicating if user has any of the roles
 */
export function hasAnyRole(session: Session | null, roles: string[]): boolean {
  if (!session?.user) return false;
  const userRoles = (session.user as any).roles || [];
  return roles.some(role => userRoles.includes(role));
}

/**
 * Utility function to get user's highest privilege level
 * @param session - User session
 * @returns Highest privilege level name or null
 */
export function getUserHighestPrivilegeLevel(session: Session | null): string | null {
  if (!session?.user) return null;
  const userRoles = (session.user as any).roles || [];
  
  const highestLevel = Math.max(
    ...userRoles.map((role: string) => ROLE_HIERARCHY[role as keyof RoleHierarchy] || 0)
  );

  return Object.keys(ROLE_HIERARCHY).find(
    key => ROLE_HIERARCHY[key as keyof RoleHierarchy] === highestLevel
  ) || null;
}
