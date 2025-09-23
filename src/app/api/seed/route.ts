import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { auth } from '@/auth';
import { withAuthorization, createAuthorizationErrorResponse } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { withCriticalRateLimit } from '@/lib/middleware/rate-limit-middleware';
import { 
  DEFAULT_ADMIN_EMAIL, 
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_MANAGER_EMAIL,
  DEFAULT_MANAGER_PASSWORD,
  DEFAULT_USER_EMAIL,
  DEFAULT_USER_PASSWORD
} from '@/lib/config/constants';

export async function POST(request: NextRequest) {
  // Apply critical rate limiting
  const rateLimitResult = withCriticalRateLimit(request);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  try {
    // Get user session
    const session = await auth();
    
    // Check authorization - only ADMIN users can seed the database
    const authResult = await withAuthorization('ADMIN')(session);
    if (!authResult.authorized) {
      return createAuthorizationErrorResponse(authResult);
    }

    logger.info('Starting database seeding...');

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Reset database first to ensure compatibility using transaction
    logger.info('Resetting database for compatibility...');

    await prisma.$transaction(async (tx) => {
      // Delete all existing data in correct order (respecting foreign key constraints)
      await tx.story.deleteMany();
      await tx.task.deleteMany();
      await tx.attendance.deleteMany();
      await tx.instagramReel.deleteMany();
      await tx.trackedInstagramPage.deleteMany();
      await tx.contentSlot.deleteMany();
      await tx.document.deleteMany();
      await tx.storyIdea.deleteMany();
      await tx.storyType.deleteMany();
      await tx.project.deleteMany();
      await tx.user.deleteMany();
    });

    logger.info('Database reset completed');

    const users = [
      {
        email: DEFAULT_ADMIN_EMAIL,
        firstName: 'Admin',
        lastName: 'User',
        password: DEFAULT_ADMIN_PASSWORD,
        roles: 'ADMIN',
      },
      {
        email: DEFAULT_USER_EMAIL,
        firstName: 'Regular',
        lastName: 'User',
        password: DEFAULT_USER_PASSWORD,
        roles: 'EMPLOYEE',
      },
      {
        email: DEFAULT_MANAGER_EMAIL,
        firstName: 'Manager',
        lastName: 'User',
        password: DEFAULT_MANAGER_PASSWORD,
        roles: 'MANAGER',
      },
    ];

    const results: any[] = [];

    // Create users in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      for (const userData of users) {
        try {
          // Create user
          const hashedPassword = await bcrypt.hash(userData.password, 12);
          const user = await tx.user.create({
            data: {
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              password: hashedPassword,
              roles: userData.roles,
              isActive: true,
            },
          });

          results.push({
            email: userData.email,
            status: 'created',
            message: 'User created successfully',
            userId: user.id,
          });

          logger.info(`User created: ${userData.email}`);
        } catch (error) {
          results.push({
            email: userData.email,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          logger.error(
            `Error creating user ${userData.email}:`,
            error instanceof Error ? error : new Error(String(error))
          );
          // Re-throw to rollback the entire transaction
          throw error;
        }
      }
    });

    // Get total user count
    const totalUsers = await prisma.user.count();

    logger.info('Database seeding completed', { results, totalUsers });

    return NextResponse.json({
      success: true,
      message: 'Database seeding completed',
      results,
      totalUsers,
      credentials: {
        admin: `${DEFAULT_ADMIN_EMAIL} / [PASSWORD_HIDDEN]`,
        user: `${DEFAULT_USER_EMAIL} / [PASSWORD_HIDDEN]`,
        manager: `${DEFAULT_MANAGER_EMAIL} / [PASSWORD_HIDDEN]`,
      },
    });
  } catch (error) {
    logger.error(
      'Database seeding failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Database seeding failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get user session
    const session = await auth();
    
    // Check authorization - only ADMIN users can seed the database
    const authResult = await withAuthorization('ADMIN')(session);
    if (!authResult.authorized) {
      return createAuthorizationErrorResponse(authResult);
    }

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Reset database first to ensure compatibility
    logger.info('Resetting database for compatibility...');

    // Delete all existing data
    await prisma.story.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.storyIdea.deleteMany();
    await prisma.storyType.deleteMany();
    await prisma.contentSlot.deleteMany();
    await prisma.project.deleteMany();
    await prisma.document.deleteMany();

    logger.info('Database reset completed');

    const users = [
      {
        email: DEFAULT_ADMIN_EMAIL,
        firstName: 'Admin',
        lastName: 'User',
        password: DEFAULT_ADMIN_PASSWORD,
        roles: 'ADMIN',
      },
      {
        email: DEFAULT_USER_EMAIL,
        firstName: 'Regular',
        lastName: 'User',
        password: DEFAULT_USER_PASSWORD,
        roles: 'EMPLOYEE',
      },
      {
        email: DEFAULT_MANAGER_EMAIL,
        firstName: 'Manager',
        lastName: 'User',
        password: DEFAULT_MANAGER_PASSWORD,
        roles: 'MANAGER',
      },
    ];

    const results: any[] = [];
    const createdUsers = [];

    for (const userData of users) {
      try {
        // Create user
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: hashedPassword,
            roles: userData.roles,
            isActive: true,
          },
        });

        results.push({
          email: userData.email,
          status: 'created',
          message: 'User created successfully',
          userId: user.id,
        });

        createdUsers.push({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          isActive: user.isActive,
          createdAt: user.createdAt,
        });

        logger.info(`User created: ${userData.email}`);
      } catch (error) {
        results.push({
          email: userData.email,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        logger.error(
          `Error creating user ${userData.email}:`,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    // Get final user count
    const finalUserCount = await prisma.user.count();

    logger.info('Automatic database seeding completed', {
      results,
      finalUserCount,
    });

    return NextResponse.json({
      success: true,
      message: 'Database automatically seeded with default users',
      results,
      userCount: finalUserCount,
      users: createdUsers,
      credentials: {
        admin: `${DEFAULT_ADMIN_EMAIL} / [PASSWORD_HIDDEN]`,
        user: `${DEFAULT_USER_EMAIL} / [PASSWORD_HIDDEN]`,
        manager: `${DEFAULT_MANAGER_EMAIL} / [PASSWORD_HIDDEN]`,
      },
    });
  } catch (error) {
    logger.error(
      'Error in GET seed handler:',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process seed request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
