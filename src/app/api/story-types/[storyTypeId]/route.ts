import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyTypeId: string }> }
) {
  try {
    // Get the user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { storyTypeId } = await params;

    // Validate storyTypeId
    if (!storyTypeId || typeof storyTypeId !== "string") {
      return NextResponse.json(
        { error: "Invalid story type ID" },
        { status: 400 }
      );
    }

    // Fetch the story type
    const storyType = await prisma.storyType.findUnique({
      where: { id: storyTypeId },
      include: {
        _count: {
          select: { stories: true }
        }
      }
    });

    if (!storyType) {
      return NextResponse.json(
        { error: "Story type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(storyType);
  } catch (error) {
    console.error("Error fetching story type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storyTypeId: string }> }
) {
  try {
    // Get the user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { storyTypeId } = await params;

    // Validate storyTypeId
    if (!storyTypeId || typeof storyTypeId !== "string") {
      return NextResponse.json(
        { error: "Invalid story type ID" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { name, icon } = body;

    // Basic validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Story type name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Check if story type exists
    const existingStoryType = await prisma.storyType.findUnique({
      where: { id: storyTypeId },
    });

    if (!existingStoryType) {
      return NextResponse.json(
        { error: "Story type not found" },
        { status: 404 }
      );
    }

    // Check if another story type with this name already exists (excluding current one)
    const duplicateStoryType = await prisma.storyType.findFirst({
      where: {
        name: name.trim(),
        id: { not: storyTypeId },
      },
    });

    if (duplicateStoryType) {
      return NextResponse.json(
        { error: "Story type with this name already exists" },
        { status: 409 }
      );
    }

    // Update the story type
    const updatedStoryType = await prisma.storyType.update({
      where: { id: storyTypeId },
      data: {
        name: name.trim(),
        icon: icon || null,
      },
    });

    return NextResponse.json(updatedStoryType);
  } catch (error) {
    console.error("Error updating story type:", error);
    
    // Handle Prisma unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Story type with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storyTypeId: string }> }
) {
  try {
    // Get the user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { storyTypeId } = await params;

    // Validate storyTypeId
    if (!storyTypeId || typeof storyTypeId !== "string") {
      return NextResponse.json(
        { error: "Invalid story type ID" },
        { status: 400 }
      );
    }

    // Check if story type exists
    const existingStoryType = await prisma.storyType.findUnique({
      where: { id: storyTypeId },
      include: {
        _count: {
          select: { stories: true }
        }
      }
    });

    if (!existingStoryType) {
      return NextResponse.json(
        { error: "Story type not found" },
        { status: 404 }
      );
    }

    // Check if story type is being used by any stories
    if (existingStoryType._count.stories > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete story type that is being used by stories",
          storyCount: existingStoryType._count.stories
        },
        { status: 409 }
      );
    }

    // Delete the story type
    await prisma.storyType.delete({
      where: { id: storyTypeId },
    });

    return NextResponse.json(
      { message: "Story type deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting story type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
