import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/utils";

export async function GET() {
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

    // Fetch all story types
    const storyTypes = await prisma.storyType.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: { stories: true }
        }
      }
    });

    return NextResponse.json(storyTypes);
  } catch (error) {
    console.error("Error fetching story types:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check if story type with this name already exists
    const existingStoryType = await prisma.storyType.findUnique({
      where: { name: name.trim() },
    });

    if (existingStoryType) {
      return NextResponse.json(
        { error: "Story type with this name already exists" },
        { status: 409 }
      );
    }

    // Create the new story type
    const storyType = await prisma.storyType.create({
      data: {
        name: name.trim(),
        icon: icon || null,
      },
    });

    return NextResponse.json(storyType, { status: 201 });
  } catch (error) {
    console.error("Error creating story type:", error);
    
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
