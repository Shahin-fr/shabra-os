import { NextRequest, NextResponse } from 'next/server';
import { prismaLocal as prisma } from '@/lib/prisma-local';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const storyTypes = await prisma.storyType.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });

    const response = NextResponse.json(storyTypes);
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching story types:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch story types' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: { message: 'Name is required' } },
        { status: 400 }
      );
    }

    const storyType = await prisma.storyType.create({
      data: {
        name,
        icon: icon || 'Palette',
        description: description || '',
        isActive: true,
      },
    });

    return NextResponse.json(storyType, { status: 201 });
  } catch (error) {
    console.error('Error creating story type:', error);
    return NextResponse.json(
      { error: { message: 'Failed to create story type' } },
      { status: 500 }
    );
  }
}
