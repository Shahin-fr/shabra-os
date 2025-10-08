import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { 
  ApiResponseBuilder,
  AnnouncementDTO,
  AnnouncementEntity,
  entityToDTO
} from '@/types';

// GET /api/announcements - Get announcements for employees
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Cap at 50
    const category = searchParams.get('category') || '';
    const widget = searchParams.get('widget') === 'true'; // For dashboard widget

    const skip = (page - 1) * limit;
    const take = widget ? 4 : limit; // Limit to 4 for widget

    // Build where clause with validation
    const where: any = {};

    // Validate category to prevent injection
    const validCategories = ['GENERAL', 'TECHNICAL', 'EVENT', 'IMPORTANT'];
    if (category && validCategories.includes(category)) {
      where.category = category;
    }

    // Get announcements with author info, sorted by pinned first, then by creation date
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
        skip: widget ? 0 : skip, // No skip for widget
        take,
      }),
      widget ? 0 : prisma.announcement.count({ where }), // No count for widget
    ]);

    // Transform entities to DTOs
    const announcementDTOs: AnnouncementDTO[] = announcements.map(announcement => entityToDTO(announcement as AnnouncementEntity));

    const response: any = {
      success: true,
      data: announcementDTOs,
    };

    // Add pagination info only if not widget
    if (!widget) {
      response.pagination = {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      };
    }

    return ApiResponseBuilder.success(response.data, 'Announcements retrieved successfully', response.pagination);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return ApiResponseBuilder.internalError('Failed to fetch announcements');
  }
}
