import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, projectId, assigneeId } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "عنوان وظیفه الزامی است" },
        { status: 400 }
      );
    }

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "شناسه پروژه الزامی است" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "پروژه مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        projectId: projectId,
        assignedTo: assigneeId || null,
        status: "PENDING", // Default status
        priority: "medium", // Default priority
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد وظیفه" },
      { status: 500 }
    );
  }
}
