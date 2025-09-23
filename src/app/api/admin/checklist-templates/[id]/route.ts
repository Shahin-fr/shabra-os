import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  tasks: z.array(z.object({
    id: z.string().optional(), // For existing tasks
    title: z.string().min(1),
    description: z.string().optional(),
    defaultAssigneeRole: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN']),
    order: z.number().int().min(0),
    isRequired: z.boolean().default(true),
    estimatedDays: z.number().int().min(1).optional(),
  })).optional(),
});

// GET /api/admin/checklist-templates/[id] - Get a specific template
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const templateId = params.id;

    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tasks: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            employeeChecklists: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      template,
    });

  } catch (error) {
    console.error('Error fetching checklist template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/checklist-templates/[id] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const templateId = params.id;
    const body = await request.json();
    const validationResult = updateTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, description, isActive, tasks } = validationResult.data;

    // Check if template exists
    const existingTemplate = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Update template with tasks in a transaction
    await prisma.$transaction(async (tx) => {
      // Update the template
      const template = await tx.checklistTemplate.update({
        where: { id: templateId },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      // Update tasks if provided
      if (tasks) {
        // Delete existing tasks
        await tx.checklistTemplateTask.deleteMany({
          where: { templateId },
        });

        // Create new tasks
        await Promise.all(
          tasks.map((task, index) =>
            tx.checklistTemplateTask.create({
              data: {
                templateId,
                title: task.title,
                description: task.description,
                defaultAssigneeRole: task.defaultAssigneeRole,
                order: task.order || index,
                isRequired: task.isRequired,
                estimatedDays: task.estimatedDays,
              },
            })
          )
        );
      }

      return template;
    });

    // Fetch the updated template with relations
    const templateWithRelations = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tasks: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            employeeChecklists: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      template: templateWithRelations,
    });

  } catch (error) {
    console.error('Error updating checklist template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/checklist-templates/[id] - Delete a template
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const templateId = params.id;

    // Check if template exists
    const existingTemplate = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: {
            employeeChecklists: true,
          },
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if template is in use
    if (existingTemplate._count.employeeChecklists > 0) {
      return NextResponse.json(
        { error: 'Cannot delete template that is in use by employee checklists' },
        { status: 400 }
      );
    }

    // Delete template (tasks will be deleted by cascade)
    await prisma.checklistTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting checklist template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
