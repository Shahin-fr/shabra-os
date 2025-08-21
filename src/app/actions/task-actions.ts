"use server";

import { revalidatePath } from "next/cache";
import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update the task status in the database
    await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    // Revalidate the specific project page and general project pages
    // This happens in the background without blocking the UI
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");

    return { success: true };
  } catch {
    return {
      success: false,
      error: "خطا در بروزرسانی وضعیت وظیفه. لطفاً دوباره تلاش کنید.",
    };
  }
}
