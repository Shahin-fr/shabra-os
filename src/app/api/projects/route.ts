import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalProjects = await prisma.project.count();
    const totalPages = Math.ceil(totalProjects / limit);

    // Get paginated projects
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
      },
      skip: offset,
      take: limit
    });
    
    // Return paginated response
    return NextResponse.json({
      projects,
      currentPage: page,
      totalPages,
      totalProjects,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });
  } catch {
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
      include: {
        _count: {
          select: {
            stories: true,
            tasks: true
          }
        }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "خطا در ایجاد پروژه" },
      { status: 500 }
    );
  }
}
