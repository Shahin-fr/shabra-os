import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withAuthorization } from '@/lib/auth/authorization';
import { z } from 'zod';

// Validation schema
const UpdateAnnouncementSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(200, 'عنوان باید کمتر از 200 کاراکتر باشد').optional(),
  content: z.string().min(1, 'محتوای اعلان الزامی است').optional(),
  category: z.enum(['GENERAL', 'TECHNICAL', 'EVENT', 'IMPORTANT'], {
    errorMap: () => ({ message: 'دسته‌بندی نامعتبر است' })
  }).optional(),
  isPinned: z.boolean().optional(),
});

// PUT /api/admin/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();
    const validatedData = UpdateAnnouncementSchema.parse(body);

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: 'اعلان یافت نشد' },
        { status: 404 }
      );
    }

    // Update announcement
    const announcement = await prisma.announcement.update({
      where: { id },
      data: validatedData,
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
      message: 'اعلان با موفقیت به‌روزرسانی شد',
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

    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی اعلان' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/announcements/[id] - Delete announcement
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: 'اعلان یافت نشد' },
        { status: 404 }
      );
    }

    // Delete announcement
    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'اعلان با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'خطا در حذف اعلان' },
      { status: 500 }
    );
  }
}
