import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SecurityDashboard, BruteForceProtection, IPManagement } from '@/lib/advanced-security';

export async function GET() {
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

    // Get brute force statistics
    const stats = SecurityDashboard.getBruteForceStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Brute force stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, identifier } = body;

    switch (action) {
      case 'unlock':
        BruteForceProtection.unlock(identifier);
        return NextResponse.json({ success: true, message: 'Account unlocked' });
      
      case 'block_ip':
        IPManagement.blockIP(identifier, 'Manual block by admin');
        return NextResponse.json({ success: true, message: 'IP blocked' });
      
      case 'unblock_ip':
        IPManagement.unblockIP(identifier, 'Manual unblock by admin');
        return NextResponse.json({ success: true, message: 'IP unblocked' });
      
      case 'whitelist_ip':
        IPManagement.whitelistIP(identifier);
        return NextResponse.json({ success: true, message: 'IP whitelisted' });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Brute force action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
