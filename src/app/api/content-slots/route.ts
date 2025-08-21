import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/content-slots - Fetch content slots for a specific week
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("weekStart");

    if (!weekStart) {
      return NextResponse.json(
        { error: "weekStart parameter is required" },
        { status: 400 }
      );
    }

    const contentSlots = await prisma.contentSlot.findMany({
      where: {
        weekStart: new Date(weekStart),
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { order: "asc" },
      ],
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(contentSlots);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch content slots" },
      { status: 500 }
    );
  }
}

// POST /api/content-slots - Create a new content slot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, dayOfWeek, weekStart, notes, projectId } = body;

    // Validate required fields
    if (!title || type === undefined || dayOfWeek === undefined || !weekStart) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the next order for the day
    const existingSlots = await prisma.contentSlot.findMany({
      where: {
        weekStart: new Date(weekStart),
        dayOfWeek: dayOfWeek,
      },
      orderBy: {
        order: "desc",
      },
      take: 1,
    });

    const nextOrder = existingSlots.length > 0 ? existingSlots[0].order + 1 : 0;

    const contentSlot = await prisma.contentSlot.create({
      data: {
        title,
        type,
        dayOfWeek,
        weekStart: new Date(weekStart),
        order: nextOrder,
        notes,
        projectId: projectId || null,
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

    return NextResponse.json(contentSlot, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create content slot" },
      { status: 500 }
    );
  }
}
