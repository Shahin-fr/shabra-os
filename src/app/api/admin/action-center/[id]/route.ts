import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const requestActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional(),
});

// GET /api/admin/action-center/[id] - Get specific request details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    if (!['ADMIN', 'MANAGER'].includes(session.user.roles)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    // Get request with user information
    const requestData = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            roles: true,
            managerId: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if user has permission to view this request
    if (session.user.roles === 'MANAGER') {
      if (requestData.user.managerId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ request: requestData });

  } catch (error) {
    console.error('Error fetching request details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/action-center/[id] - Approve or reject a request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    if (!['ADMIN', 'MANAGER'].includes(session.user.roles)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = requestActionSchema.parse(body);

    // Get the request
    const requestData = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if user has permission to act on this request
    if (session.user.roles === 'MANAGER') {
      if (requestData.user.managerId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Check if request is still pending
    if (requestData.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    // Validate rejection reason if rejecting
    if (validatedData.action === 'REJECT' && !validatedData.rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a request' },
        { status: 400 }
      );
    }

    // Update the request
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: {
        status: validatedData.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        rejectionReason: validatedData.action === 'REJECT' ? validatedData.rejectionReason : null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      request: updatedRequest,
      message: `Request ${validatedData.action.toLowerCase()}d successfully`,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing request action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
