import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate required fields
    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { error: "وضعیت وظیفه الزامی است" },
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "وضعیت نامعتبر است" },
        { status: 400 }
      );
    }

    // Verify task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "وظیفه مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // Update the task status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as any },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی وظیفه" },
      { status: 500 }
    );
  }
}
