import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
// import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';

// GET /api/instapulse/pages - Fetch all tracked Instagram pages
export async function GET() {
  try {
    const pages = await prisma.trackedInstagramPage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const successResponse = createSuccessResponse(pages);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/instapulse/pages',
      source: 'api/instapulse/pages/route.ts',
    });
  }
}

// POST /api/instapulse/pages - Add a new tracked Instagram page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Processing request body
    
    const { username } = body;
    
    // Extracted username from request

    // Validate that username is provided
    if (!username || typeof username !== 'string' || username.trim() === '') {
      const errorResponse = createValidationErrorResponse(
        'Username is required and must be a non-empty string',
        'username'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Clean and validate username format
    const cleanUsername = username.trim().toLowerCase();

    // Basic Instagram username validation (alphanumeric, dots, underscores)
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      const errorResponse = createValidationErrorResponse(
        'Username contains invalid characters. Only letters, numbers, dots, and underscores are allowed',
        'username'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Construct profile URL
    const profileUrl = `https://www.instagram.com/${cleanUsername}/`;

    // Create new tracked page
    const newPage = await prisma.trackedInstagramPage.create({
      data: {
        username: cleanUsername,
        profileUrl,
        followerCount: 0,
        status: 'ACTIVE',
      },
    });

    const successResponse = createSuccessResponse(
      newPage,
      'Instagram page added successfully'
    );
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.CREATED,
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'POST /api/instapulse/pages',
      source: 'api/instapulse/pages/route.ts',
    });
  }
}

// DELETE /api/instapulse/pages - Delete a tracked Instagram page
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    // Validate that id is provided
    if (!idParam) {
      const errorResponse = createValidationErrorResponse(
        'Page ID is required',
        'id'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate that id is a valid number
    const id = parseInt(idParam);
    if (isNaN(id) || id <= 0) {
      const errorResponse = createValidationErrorResponse(
        'Page ID must be a valid positive number',
        'id'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if page exists before attempting to delete
    const existingPage = await prisma.trackedInstagramPage.findUnique({
      where: { id },
    });

    if (!existingPage) {
      const errorResponse = createNotFoundErrorResponse(
        'Tracked Instagram page'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Delete the page (this will also cascade delete related reels)
    await prisma.trackedInstagramPage.delete({
      where: { id },
    });

    const successResponse = createSuccessResponse(
      { id, username: existingPage.username },
      'Instagram page removed successfully'
    );
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'DELETE /api/instapulse/pages',
      source: 'api/instapulse/pages/route.ts',
    });
  }
}
