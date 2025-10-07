import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AuditLogger } from '@/lib/advanced-security';

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const userId = searchParams.get('userId');
    const riskLevel = searchParams.get('riskLevel');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build filters
    const filters: any = {};
    if (eventType) filters.eventType = eventType;
    if (userId) filters.userId = userId;
    if (riskLevel) filters.riskLevel = riskLevel;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (limit) filters.limit = limit;

    // Get audit logs
    const logs = await AuditLogger.getAuditLogs(filters);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
