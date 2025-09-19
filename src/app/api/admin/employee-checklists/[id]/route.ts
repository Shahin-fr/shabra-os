import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateChecklistSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

// GET /api/admin/employee-checklists/[id] - Get a specific checklist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checklistId = params.id;

    const checklist = await prisma.employeeChecklist.findUnique({
      where: { id: checklistId },
      include: {
        template: {
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            managerId: true,
          },
        },
      },
    });

    if (!checklist) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 });
    }

    // Check permissions
    const canView = 
      session.user.id === checklist.employeeId || 
      session.user.roles.includes('ADMIN') || 
      (session.user.roles.includes('MANAGER') && checklist.employee.managerId === session.user.id);

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get related tasks
    const relatedTasks = await prisma.task.findMany({
      where: {
        metadata: {
          path: ['employeeChecklistId'],
          equals: checklistId,
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      checklist: {
        ...checklist,
        relatedTasks,
      },
    });

  } catch (error) {
    console.error('Error fetching employee checklist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/employee-checklists/[id] - Update a checklist
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has required roles
    if (!session.user.roles.includes('ADMIN') && !session.user.roles.includes('MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const checklistId = params.id;
    const body = await request.json();
    const validationResult = updateChecklistSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { status, notes } = validationResult.data;

    // Check if checklist exists
    const existingChecklist = await prisma.employeeChecklist.findUnique({
      where: { id: checklistId },
      include: {
        employee: {
          select: {
            id: true,
            managerId: true,
          },
        },
      },
    });

    if (!existingChecklist) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 });
    }

    // Check permissions
    const canUpdate = 
      session.user.roles.includes('ADMIN') || 
      (session.user.roles.includes('MANAGER') && existingChecklist.employee.managerId === session.user.id);

    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update checklist
    const updatedChecklist = await prisma.employeeChecklist.update({
      where: { id: checklistId },
      data: {
        ...(status && { 
          status,
          ...(status === 'COMPLETED' && { completedAt: new Date() }),
        }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        template: {
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      checklist: updatedChecklist,
    });

  } catch (error) {
    console.error('Error updating employee checklist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/employee-checklists/[id] - Cancel a checklist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has required roles
    if (!session.user.roles.includes('ADMIN') && !session.user.roles.includes('MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const checklistId = params.id;

    // Check if checklist exists
    const existingChecklist = await prisma.employeeChecklist.findUnique({
      where: { id: checklistId },
      include: {
        employee: {
          select: {
            id: true,
            managerId: true,
          },
        },
      },
    });

    if (!existingChecklist) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 });
    }

    // Check permissions
    const canDelete = 
      session.user.roles.includes('ADMIN') || 
      (session.user.roles.includes('MANAGER') && existingChecklist.employee.managerId === session.user.id);

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cancel checklist and related tasks
    await prisma.$transaction(async (tx) => {
      // Update checklist status to cancelled
      await tx.employeeChecklist.update({
        where: { id: checklistId },
        data: { status: 'CANCELLED' },
      });

      // Cancel related tasks
      await tx.task.updateMany({
        where: {
          metadata: {
            path: ['employeeChecklistId'],
            equals: checklistId,
          },
          status: { in: ['Todo', 'InProgress'] },
        },
        data: { status: 'Done' }, // Mark as done to indicate cancellation
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Checklist cancelled successfully',
    });

  } catch (error) {
    console.error('Error cancelling employee checklist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
