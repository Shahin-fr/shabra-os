import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['ONBOARDING', 'OFFBOARDING']),
  description: z.string().optional(),
  tasks: z.array(z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    defaultAssigneeRole: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN']),
    order: z.number().int().min(0).default(0),
    isRequired: z.boolean().default(true),
    estimatedDays: z.number().int().min(1).optional(),
  })).min(1, 'At least one task is required'),
});

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

// GET /api/admin/checklist-templates - Get all templates
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/admin/checklist-templates - Starting request');
    
    const session = await auth();
    
    if (!session?.user) {
      console.log('GET /api/admin/checklist-templates - No session found');
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.roles?.includes('ADMIN')) {
      console.log('GET /api/admin/checklist-templates - User not admin:', session.user.roles);
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    console.log('GET /api/admin/checklist-templates - Query params:', { type, isActive });

    const where: any = {};
    if (type && ['ONBOARDING', 'OFFBOARDING'].includes(type)) {
      where.type = type;
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    console.log('GET /api/admin/checklist-templates - Where clause:', where);

    const templates = await prisma.checklistTemplate.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    console.log('GET /api/admin/checklist-templates - Found templates:', templates.length);

    return NextResponse.json({
      success: true,
      templates: templates || [],
    });

  } catch (error) {
    console.error('Error fetching checklist templates:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/checklist-templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = createTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, type, description, tasks } = validationResult.data;

    // Create template with tasks in a transaction
    const template = await prisma.$transaction(async (tx) => {
      // Create the template
      const newTemplate = await tx.checklistTemplate.create({
        data: {
          name,
          type,
          description,
          createdById: session.user.id,
        },
      });

      // Create the tasks
      const createdTasks = await Promise.all(
        tasks.map((task, index) =>
          tx.checklistTemplateTask.create({
            data: {
              templateId: newTemplate.id,
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

      return {
        ...newTemplate,
        tasks: createdTasks,
      };
    });

    return NextResponse.json({
      success: true,
      template,
    });

  } catch (error) {
    console.error('Error creating checklist template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
