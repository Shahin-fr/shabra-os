import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            stories: true,
            tasks: true
          }
        }
      }
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پروژه‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "نام پروژه الزامی است" },
        { status: 400 }
      );
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        status: "active", // Default status
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد پروژه" },
      { status: 500 }
    );
  }
}
