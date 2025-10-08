import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withAuthorization } from '@/lib/auth/authorization';
import { z } from 'zod';
import { 
  ApiResponseBuilder,
  AnnouncementDTO,
  CreateAnnouncementDTO,
  AnnouncementEntity,
  entityToDTO,
  validateCreateDTO,
  CreateAnnouncementDTOSchema
} from '@/types';

// POST /api/admin/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check authorization
    const authResult = await withAuthorization(['ADMIN', 'MANAGER'])(session);

    if (!authResult.authorized) {
      return ApiResponseBuilder.unauthorized(authResult.message);
    }

    const body = await request.json();
    const createAnnouncementData = validateCreateDTO(body, CreateAnnouncementDTOSchema) as CreateAnnouncementDTO;

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        ...createAnnouncementData,
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

    // Transform entity to DTO
    const announcementDTO = entityToDTO(announcement as AnnouncementEntity);

    return ApiResponseBuilder.created(announcementDTO, 'Announcement created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponseBuilder.validationError('Invalid input data', error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      })));
    }

    console.error('Error creating announcement:', error);
    return ApiResponseBuilder.internalError('Failed to create announcement');
  }
}

// GET /api/admin/announcements - Get all announcements for admin view
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check authorization
    const authResult = await withAuthorization(['ADMIN', 'MANAGER'])(session);

    if (!authResult.authorized) {
      return ApiResponseBuilder.unauthorized(authResult.message);
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

    // Transform entities to DTOs
    const announcementDTOs: AnnouncementDTO[] = announcements.map(announcement => entityToDTO(announcement as AnnouncementEntity));

    const pagination = {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    };

    return ApiResponseBuilder.success(announcementDTOs, 'Announcements retrieved successfully', pagination);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return ApiResponseBuilder.internalError('Failed to fetch announcements');
  }
}
