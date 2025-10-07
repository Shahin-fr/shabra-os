import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SecurityDashboard } from '@/lib/advanced-security';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const userRoles = (session.user as any).roles || [];
    if (!userRoles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get security overview
    const overview = await SecurityDashboard.getSecurityOverview();

    return NextResponse.json(overview);
  } catch (error) {
    console.error('Security overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
