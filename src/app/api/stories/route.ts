import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");

    if (!day) {
      return NextResponse.json(
        { error: "پارامتر روز الزامی است" },
        { status: 400 }
      );
    }

    // Parse the day parameter (expected format: YYYY-MM-DD)
    const dayDate = new Date(day);
    if (isNaN(dayDate.getTime())) {
      return NextResponse.json(
        { error: "فرمت تاریخ نامعتبر است" },
        { status: 400 }
      );
    }

    // Set the time to start of day and end of day
    const startOfDay = new Date(dayDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dayDate);
    endOfDay.setHours(23, 59, 59, 999);

    const stories = await prisma.story.findMany({
      where: {
        day: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        order: "asc",
      },
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
          },
        },
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "خطا در دریافت استوری‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, notes, visualNotes, link, day, order, projectId, storyTypeId } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "عنوان استوری الزامی است" },
        { status: 400 }
      );
    }

    if (!day) {
      return NextResponse.json(
        { error: "تاریخ الزامی است" },
        { status: 400 }
      );
    }

    // Parse the day
    const dayDate = new Date(day);
    if (isNaN(dayDate.getTime())) {
      return NextResponse.json(
        { error: "فرمت تاریخ نامعتبر است" },
        { status: 400 }
      );
    }

    // If projectId is provided, verify it exists
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return NextResponse.json(
          { error: "پروژه مورد نظر یافت نشد" },
          { status: 404 }
        );
      }
    }

    // If storyTypeId is provided, verify it exists
    if (storyTypeId) {
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

    // Define date range variables
    const startOfDay = new Date(dayDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dayDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Use the provided order value, or calculate a new one if not provided
    let newOrder: number;
    
    if (order && typeof order === 'number' && order > 0) {
      // Use the provided order value
      newOrder = order;
      
      // Check if there's already a story with this order on the same day
      const existingStory = await prisma.story.findFirst({
        where: {
          day: {
            gte: startOfDay,
            lte: endOfDay,
          },
          order: newOrder,
        },
      });
      
      if (existingStory) {
        // If there's a conflict, we could either:
        // 1. Return an error
        // 2. Shift existing stories to make room
        // For now, let's return an error to be explicit
        return NextResponse.json(
          { error: `اسلات شماره ${newOrder} قبلاً اشغال شده است` },
          { status: 409 }
        );
      }
    } else {
      // Calculate a new order value if none provided
      const maxOrder = await prisma.story.aggregate({
        where: {
          day: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        _max: {
          order: true,
        },
      });

      newOrder = (maxOrder._max.order || 0) + 1;
    }

    // Create the story
    const story = await prisma.story.create({
      data: {
        title: title.trim(),
        notes: notes?.trim() || null,
        visualNotes: visualNotes?.trim() || null,
        link: link?.trim() || null,
        day: dayDate,
        order: newOrder,
        status: "DRAFT", // Default status for new stories
        projectId: projectId || null,
        storyTypeId: storyTypeId || null,
      },
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
          },
        },
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد استوری" },
      { status: 500 }
    );
  }
}
