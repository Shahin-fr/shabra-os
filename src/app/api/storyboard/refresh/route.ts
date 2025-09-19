import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';

export async function GET() {
  try {
    // Get all active story types
    const storyTypes = await prisma.storyType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    // Get all active story ideas
    const storyIdeas = await prisma.storyIdea.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
    });

    // Get first project
    const project = await prisma.project.findFirst({
      select: { id: true, name: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        storyTypes,
        storyIdeas,
        defaultProjectId: project?.id || null,
        projectName: project?.name || null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/storyboard/refresh',
      source: 'api/storyboard/refresh/route.ts',
    });
  }
}
