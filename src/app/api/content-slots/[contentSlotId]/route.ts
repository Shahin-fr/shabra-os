import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/content-slots/[contentSlotId] - Get a specific content slot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentSlotId: string }> }
) {
  try {
    const { contentSlotId } = await params;

    const contentSlot = await prisma.contentSlot.findUnique({
      where: { id: contentSlotId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!contentSlot) {
      return NextResponse.json(
        { error: "Content slot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contentSlot);
  } catch (error) {
    console.error("Error fetching content slot:", error);
    return NextResponse.json(
      { error: "Failed to fetch content slot" },
      { status: 500 }
    );
  }
}

// PATCH /api/content-slots/[contentSlotId] - Update a content slot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ contentSlotId: string }> }
) {
  try {
    const { contentSlotId } = await params;
    const body = await request.json();

    // Check if content slot exists
    const existingSlot = await prisma.contentSlot.findUnique({
      where: { id: contentSlotId },
    });

    if (!existingSlot) {
      return NextResponse.json(
        { error: "Content slot not found" },
        { status: 404 }
      );
    }

    // Update the content slot
    const updatedSlot = await prisma.contentSlot.update({
      where: { id: contentSlotId },
      data: {
        title: body.title,
        type: body.type,
        dayOfWeek: body.dayOfWeek,
        weekStart: body.weekStart ? new Date(body.weekStart) : undefined,
        notes: body.notes,
        projectId: body.projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSlot);
  } catch (error) {
    console.error("Error updating content slot:", error);
    return NextResponse.json(
      { error: "Failed to update content slot" },
      { status: 500 }
    );
  }
}

// DELETE /api/content-slots/[contentSlotId] - Delete a content slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contentSlotId: string }> }
) {
  try {
    const { contentSlotId } = await params;

    // Check if content slot exists
    const existingSlot = await prisma.contentSlot.findUnique({
      where: { id: contentSlotId },
    });

    if (!existingSlot) {
      return NextResponse.json(
        { error: "Content slot not found" },
        { status: 404 }
      );
    }

    // Delete the content slot
    await prisma.contentSlot.delete({
      where: { id: contentSlotId },
    });

    return NextResponse.json({ message: "Content slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting content slot:", error);
    return NextResponse.json(
      { error: "Failed to delete content slot" },
      { status: 500 }
    );
  }
}
