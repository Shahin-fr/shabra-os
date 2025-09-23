import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const holidayUpdateSchema = z.object({
  name: z.string().min(1, 'Holiday name is required').optional(),
  date: z.string().datetime('Invalid date format').optional(),
});

// GET /api/admin/holidays/[id] - Get a specific holiday
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    if (!['ADMIN', 'MANAGER'].some(role => (session.user.roles as string[]).includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    const holiday = await prisma.holiday.findUnique({
      where: { id }
    });

    if (!holiday) {
      return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }

    return NextResponse.json({ holiday });

  } catch (error) {
    console.error('Error fetching holiday:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/holidays/[id] - Update a holiday
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
    if (!['ADMIN', 'MANAGER'].some(role => (session.user.roles as string[]).includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = holidayUpdateSchema.parse(body);

    // Check if holiday exists
    const existingHoliday = await prisma.holiday.findUnique({
      where: { id }
    });

    if (!existingHoliday) {
      return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }

    // If updating date, check for conflicts
    if (validatedData.date) {
      const conflictingHoliday = await prisma.holiday.findFirst({
        where: {
          date: new Date(validatedData.date),
          id: { not: id }
        }
      });

      if (conflictingHoliday) {
        return NextResponse.json(
          { error: 'A holiday already exists for this date' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.date) updateData.date = new Date(validatedData.date);

    const holiday = await prisma.holiday.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ holiday });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating holiday:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/holidays/[id] - Delete a holiday
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    if (!['ADMIN', 'MANAGER'].some(role => (session.user.roles as string[]).includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    // Check if holiday exists
    const existingHoliday = await prisma.holiday.findUnique({
      where: { id }
    });

    if (!existingHoliday) {
      return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }

    await prisma.holiday.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Holiday deleted successfully' });

  } catch (error) {
    console.error('Error deleting holiday:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
