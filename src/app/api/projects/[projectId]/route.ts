import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    // Fetch the project with its tasks
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            stories: true,
            tasks: true
          }
        }
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "پروژه مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پروژه" },
      { status: 500 }
    );
  }
}
