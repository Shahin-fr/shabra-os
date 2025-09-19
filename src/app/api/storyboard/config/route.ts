import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';

export async function GET() {
  try {
    // Get the first project and first story type
    const [project, storyType] = await Promise.all([
      prisma.project.findFirst({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.storyType.findFirst({
        select: {
          id: true,
          name: true,
        },
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    if (!project || !storyType) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        defaultProjectId: project.id,
        defaultStoryTypeId: storyType.id,
        projectName: project.name,
        storyTypeName: storyType.name,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/storyboard/config',
      source: 'api/storyboard/config/route.ts',
    });
  }
}
