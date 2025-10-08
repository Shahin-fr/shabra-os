import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const assignChecklistSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  templateId: z.string().min(1, 'Template ID is required'),
  notes: z.string().optional(),
});

// GET /api/admin/employee-checklists - Get checklists for an employee
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
    }

    // Check permissions
    const targetUser = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { id: true, managerId: true, roles: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions: User can view their own checklists, Admin/Manager can view their subordinates
    const canView = 
      session.user.id === employeeId || 
      session.user.roles.includes('ADMIN') || 
      (session.user.roles.includes('MANAGER') && targetUser.managerId === session.user.id);

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get employee checklists
    const checklists = await prisma.employeeChecklist.findMany({
      where: { employeeId },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      checklists,
    });

  } catch (error) {
    console.error('Error fetching employee checklists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/employee-checklists - Assign a checklist to an employee
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has required roles
    if (!session.user.roles.includes('ADMIN') && !session.user.roles.includes('MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = assignChecklistSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { employeeId, templateId, notes } = validationResult.data;

    // Check if employee exists
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { id: true, managerId: true, roles: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check permissions: Admin can assign to anyone, Manager can assign to their subordinates
    if (session.user.roles.includes('MANAGER') && employee.managerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if template exists and is active
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (!template.isActive) {
      return NextResponse.json({ error: 'Template is not active' }, { status: 400 });
    }

    // Check if employee already has this template assigned
    const existingChecklist = await prisma.employeeChecklist.findFirst({
      where: {
        employeeId,
        templateId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    if (existingChecklist) {
      return NextResponse.json(
        { error: 'Employee already has this checklist assigned and in progress' },
        { status: 400 }
      );
    }

    // Create employee checklist and generate tasks
    const result = await prisma.$transaction(async (tx) => {
      // Create the employee checklist
      const employeeChecklist = await tx.employeeChecklist.create({
        data: {
          employeeId,
          templateId,
          notes,
        },
      });

      // Get employee's manager for task assignment
      const employeeWithManager = await tx.user.findUnique({
        where: { id: employeeId },
        include: {
          manager: {
            select: { id: true },
          },
        },
      });

      // Generate tasks for each template task
      const generatedTasks = await Promise.all(
        template.tasks.map(async (templateTask) => {
          let assigneeId: string;

          // Determine assignee based on defaultAssigneeRole
          switch (templateTask.defaultAssigneeRole) {
            case 'EMPLOYEE':
              assigneeId = employeeId;
              break;
            case 'MANAGER':
              assigneeId = employeeWithManager?.manager?.id || session.user.id;
              break;
            case 'ADMIN': {
              // Find an admin user
              const adminUser = await tx.user.findFirst({
                where: { roles: { contains: 'ADMIN' } },
                select: { id: true },
              });
              assigneeId = adminUser?.id || session.user.id;
              break;
            }
            default:
              assigneeId = employeeId;
          }

          // Calculate due date based on estimated days
          const dueDate = templateTask.estimatedDays
            ? new Date(Date.now() + templateTask.estimatedDays * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

          return tx.task.create({
            data: {
              title: templateTask.title,
              description: templateTask.description || '',
              assignedTo: assigneeId,
              createdBy: session.user.id,
              dueDate,
              // priority: templateTask.isRequired ? 'HIGH' : 'MEDIUM', // Field doesn't exist in Task model
              status: 'Todo',
              // Link to the employee checklist - metadata field doesn't exist in Task model
              // metadata: {
              //   employeeChecklistId: employeeChecklist.id,
              //   templateTaskId: templateTask.id,
              //   isChecklistTask: true,
              // },
            },
          });
        })
      );

      return {
        employeeChecklist,
        generatedTasks,
      };
    });

    return NextResponse.json({
      success: true,
      checklist: result.employeeChecklist,
      generatedTasks: result.generatedTasks,
      message: `Checklist assigned successfully. ${result.generatedTasks.length} tasks created.`,
    });

  } catch (error) {
    console.error('Error assigning checklist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
