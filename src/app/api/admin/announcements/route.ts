import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withAuthorization } from '@/lib/auth/authorization';
import { z } from 'zod';

// Validation schemas
const CreateAnnouncementSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(200, 'عنوان باید کمتر از 200 کاراکتر باشد'),
  content: z.string().min(1, 'محتوای اعلان الزامی است'),
  category: z.enum(['GENERAL', 'TECHNICAL', 'EVENT', 'IMPORTANT'], {
    errorMap: () => ({ message: 'دسته‌بندی نامعتبر است' })
  }),
  isPinned: z.boolean().default(false),
});

// const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial();

// POST /api/admin/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check authorization
    const authResult = await withAuthorization(['ADMIN', 'MANAGER'])(session);

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.statusCode }
      );
    }

    const body = await request.json();
    const validatedData = CreateAnnouncementSchema.parse(body);

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        ...validatedData,
        authorId: session?.user?.id || '',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: announcement,
      message: 'اعلان با موفقیت ایجاد شد',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'داده‌های ورودی نامعتبر است',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد اعلان' },
      { status: 500 }
    );
  }
}

// GET /api/admin/announcements - Get all announcements for admin view
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check authorization
    const authResult = await withAuthorization(['ADMIN', 'MANAGER'])(session);

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.statusCode }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Cap at 50
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category') || '';
    const isPinned = searchParams.get('isPinned');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search && search.length >= 2) { // Minimum 2 characters for search
      // Sanitize search input
      const sanitizedSearch = search.replace(/[<>"'%;()&+]/g, '');
      where.OR = [
        { title: { contains: sanitizedSearch, mode: 'insensitive' } },
        { content: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    // Validate category to prevent injection
    const validCategories = ['GENERAL', 'TECHNICAL', 'EVENT', 'IMPORTANT'];
    if (category && validCategories.includes(category)) {
      where.category = category;
    }

    if (isPinned !== null && isPinned !== undefined) {
      where.isPinned = isPinned === 'true';
    }

    // Get announcements with author info
    const [announcements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.announcement.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: announcements,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست اعلان‌ها' },
      { status: 500 }
    );
  }
}
