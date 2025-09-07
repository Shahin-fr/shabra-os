import { NextRequest, NextResponse } from 'next/server';
import { prismaLocal as prisma } from '@/lib/prisma-local';

export async function GET() {
  try {
    // Get all projects and story types
    const [projects, storyTypes] = await Promise.all([
      prisma.project.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      prisma.storyType.findMany({
        select: {
          id: true,
          name: true,
          icon: true,
        },
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        storyTypes,
        defaultProject: projects[0]?.id || null,
        defaultStoryType: storyTypes[0]?.id || null,
      }
    });

  } catch (error) {
    console.error('Error fetching storyboard IDs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch IDs' },
      { status: 500 }
    );
  }
}
