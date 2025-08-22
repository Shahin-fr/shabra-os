import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await params;
    const body = await request.json();
    const { title, notes, visualNotes, link, order, storyTypeId } = body;

    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "استوری مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { error: "عنوان استوری نمی‌تواند خالی باشد" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (notes !== undefined) {
      updateData.notes = notes?.trim() || null;
    }



    if (visualNotes !== undefined) {
      updateData.visualNotes = visualNotes?.trim() || null;
    }

    if (link !== undefined) {
      updateData.link = link?.trim() || null;
    }



    if (storyTypeId !== undefined) {
      if (storyTypeId) {
        // Verify story type exists
        const storyType = await prisma.storyType.findUnique({
          where: { id: storyTypeId },
        });

        if (!storyType) {
          return NextResponse.json(
            { error: "نوع استوری مورد نظر یافت نشد" },
            { status: 404 }
          );
        }
      }
      updateData.storyTypeId = storyTypeId || null;
    }

    if (order !== undefined) {
      if (typeof order !== "number" || order < 0) {
        return NextResponse.json(
          { error: "ترتیب باید عدد مثبت باشد" },
          { status: 400 }
        );
      }
      updateData.order = order;
    }

    // Update the story
    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        storyType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json(updatedStory);
  } catch {
    return NextResponse.json(
      { error: "خطا در بروزرسانی استوری" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await params;

    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "استوری مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // Delete the story
    await prisma.story.delete({
      where: { id: storyId },
    });

    return NextResponse.json({ message: "استوری با موفقیت حذف شد" });
  } catch {
    return NextResponse.json(
      { error: "خطا در حذف استوری" },
      { status: 500 }
    );
  }
}
