import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';

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
          createdAt: 'asc',
        },
      }),
      prisma.storyType.findMany({
        select: {
          id: true,
          name: true,
          icon: true,
        },
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        storyTypes,
        defaultProject: projects[0]?.id || null,
        defaultStoryType: storyTypes[0]?.id || null,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/storyboard/ids',
      source: 'api/storyboard/ids/route.ts',
    });
  }
}
