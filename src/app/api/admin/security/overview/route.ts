import { auth } from '@/auth';
import { SecurityDashboard } from '@/lib/advanced-security';
import { ApiResponseBuilder } from '@/types';

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    // Check if user has admin role
    const userRoles = (session.user as any).roles || [];
    if (!userRoles.includes('ADMIN')) {
      return ApiResponseBuilder.forbidden('Admin access required');
    }

    // Get security overview
    const overview = await SecurityDashboard.getSecurityOverview();

    return ApiResponseBuilder.success(overview, 'Security overview retrieved successfully');
  } catch (error) {
    console.error('Security overview error:', error);
    return ApiResponseBuilder.internalError('Failed to retrieve security overview');
  }
}
