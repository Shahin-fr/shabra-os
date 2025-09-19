import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const workScheduleSchema = z.object({
  saturday: z.boolean(),
  sunday: z.boolean(),
  monday: z.boolean(),
  tuesday: z.boolean(),
  wednesday: z.boolean(),
  thursday: z.boolean(),
  friday: z.boolean(),
});

// GET /api/admin/work-schedules/[userId] - Get work schedule for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create work schedule
    let workSchedule = await prisma.workSchedule.findUnique({
      where: { userId }
    });

    if (!workSchedule) {
      // Create default work schedule (all days working)
      workSchedule = await prisma.workSchedule.create({
        data: {
          userId,
          saturday: true,
          sunday: true,
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
        }
      });
    }

    return NextResponse.json({
      workSchedule,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      }
    });

  } catch (error) {
    console.error('Error fetching work schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/work-schedules/[userId] - Update work schedule for a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params;
    const body = await request.json();

    // Validate request body
    const validatedData = workScheduleSchema.parse(body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create work schedule
    const workSchedule = await prisma.workSchedule.upsert({
      where: { userId },
      update: validatedData,
      create: {
        userId,
        ...validatedData
      }
    });

    return NextResponse.json({
      workSchedule,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating work schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
