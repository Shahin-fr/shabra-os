import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const holidaySchema = z.object({
  name: z.string().min(1, 'Holiday name is required'),
  date: z.string().datetime('Invalid date format'),
});

// GET /api/admin/holidays - Get all holidays
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    if (!['ADMIN', 'MANAGER'].some(role => (session.user.roles as string[]).includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const upcoming = searchParams.get('upcoming') === 'true';

    let whereClause: any = {};

    if (year) {
      const startOfYear = new Date(`${year}-01-01`);
      const endOfYear = new Date(`${year}-12-31`);
      whereClause.date = {
        gte: startOfYear,
        lte: endOfYear
      };
    }

    if (upcoming) {
      whereClause.date = {
        gte: new Date()
      };
    }

    const holidays = await prisma.holiday.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({ holidays });

  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/holidays - Create a new holiday
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    if (!['ADMIN', 'MANAGER'].some(role => (session.user.roles as string[]).includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = holidaySchema.parse(body);

    // Check if holiday already exists for this date
    const existingHoliday = await prisma.holiday.findUnique({
      where: { date: new Date(validatedData.date) }
    });

    if (existingHoliday) {
      return NextResponse.json(
        { error: 'A holiday already exists for this date' },
        { status: 409 }
      );
    }

    const holiday = await prisma.holiday.create({
      data: {
        name: validatedData.name,
        date: new Date(validatedData.date)
      }
    });

    return NextResponse.json({ holiday }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating holiday:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
