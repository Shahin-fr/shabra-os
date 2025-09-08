import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with special key
    const authHeader = request.headers.get('authorization');
    const isAuthorized = 
      process.env.NODE_ENV === 'development' || 
      authHeader === `Bearer ${process.env.SEED_SECRET}`;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting database seeding...');

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
        email: 'admin@shabra.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin-password-123',
        roles: 'ADMIN',
      },
      {
        email: 'user@shabra.com',
        firstName: 'Regular',
        lastName: 'User',
        password: 'user-password-123',
        roles: 'EMPLOYEE',
      },
      {
        email: 'manager@shabra.com',
        firstName: 'Manager',
        lastName: 'User',
        password: 'manager-password-123',
        roles: 'MANAGER',
      },
    ];

    const results = [];

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

        logger.info(`User created: ${userData.email}`);
      } catch (error) {
        results.push({
          email: userData.email,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        logger.error(`Error creating user ${userData.email}:`, error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Get total user count
    const totalUsers = await prisma.user.count();

    logger.info('Database seeding completed', { results, totalUsers });

    return NextResponse.json({
      success: true,
      message: 'Database seeding completed',
      results,
      totalUsers,
      credentials: {
        admin: 'admin@shabra.com / admin-password-123',
        user: 'user@shabra.com / user-password-123',
        manager: 'manager@shabra.com / manager-password-123',
      },
    });

  } catch (error) {
    logger.error('Database seeding failed:', error instanceof Error ? error : new Error(String(error)));
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
        email: 'admin@shabra.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin-password-123',
        roles: 'ADMIN',
      },
      {
        email: 'user@shabra.com',
        firstName: 'Regular',
        lastName: 'User',
        password: 'user-password-123',
        roles: 'EMPLOYEE',
      },
      {
        email: 'manager@shabra.com',
        firstName: 'Manager',
        lastName: 'User',
        password: 'manager-password-123',
        roles: 'MANAGER',
      },
    ];

    const results = [];
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
        logger.error(`Error creating user ${userData.email}:`, error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Get final user count
    const finalUserCount = await prisma.user.count();

    logger.info('Automatic database seeding completed', { results, finalUserCount });

    return NextResponse.json({
      success: true,
      message: 'Database automatically seeded with default users',
      results,
      userCount: finalUserCount,
      users: createdUsers,
      credentials: {
        admin: 'admin@shabra.com / admin-password-123',
        user: 'user@shabra.com / user-password-123',
        manager: 'manager@shabra.com / manager-password-123',
      },
    });

  } catch (error) {
    logger.error('Error in GET seed handler:', error instanceof Error ? error : new Error(String(error)));
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