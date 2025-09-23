import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/announcements/recent - Get recent announcements for employees
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    // Get announcements from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const announcements = await prisma.announcement.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
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
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 10, // Limit to 10 recent announcements
    });

    // Transform the data to match the expected format
    const transformedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      type: announcement.category, // Map category to type
      author: {
        name: `${announcement.author.firstName} ${announcement.author.lastName}`,
        avatar: announcement.author.avatar,
      },
      createdAt: announcement.createdAt.toISOString(),
      isRead: false, // For now, we'll assume all are unread
    }));

    return NextResponse.json({
      success: true,
      data: transformedAnnouncements,
    });
  } catch (error) {
    console.error('Error fetching recent announcements:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اعلان‌های اخیر' },
      { status: 500 }
    );
  }
}
