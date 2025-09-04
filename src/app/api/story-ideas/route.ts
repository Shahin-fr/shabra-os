import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const storyType = searchParams.get('storyType');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build where clause
    const where: any = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (storyType && storyType !== 'all') {
      where.storyType = storyType;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const storyIdeas = await prisma.storyIdea.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { category: 'asc' },
        { title: 'asc' },
      ],
    });

    return NextResponse.json(storyIdeas);
  } catch (error) {
    console.error('Error fetching story ideas:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch story ideas' } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, storyType, template, guidelines, icon } = body;

    if (!title || !description || !category || !storyType) {
      return NextResponse.json(
        { error: { message: 'Title, description, category, and storyType are required' } },
        { status: 400 }
      );
    }

    const storyIdea = await prisma.storyIdea.create({
      data: {
        title,
        description,
        category,
        storyType,
        template: template || '',
        guidelines: guidelines || '',
        icon: icon || 'Lightbulb',
        isActive: true,
      },
    });

    return NextResponse.json(storyIdea, { status: 201 });
  } catch (error) {
    console.error('Error creating story idea:', error);
    return NextResponse.json(
      { error: { message: 'Failed to create story idea' } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}