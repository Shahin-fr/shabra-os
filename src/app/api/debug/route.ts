import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(_request: NextRequest) {
  try {
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
    };

    // Check environment variables
    debugInfo.env = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT_SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
      PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL ? 'SET' : 'NOT_SET',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT_SET',
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      debugInfo.database = { status: 'connected' };
    } catch (error) {
      debugInfo.database = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Test authentication
    try {
      const session = await auth();
      debugInfo.auth = {
        status: 'working',
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id || 'none',
        roles: session?.user?.roles || [],
      };
    } catch (error) {
      debugInfo.auth = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test basic database operations
    try {
      const userCount = await prisma.user.count();
      const projectCount = await prisma.project.count();
      const taskCount = await prisma.task.count();
      
      debugInfo.databaseOperations = {
        status: 'working',
        userCount,
        projectCount,
        taskCount,
      };
    } catch (error) {
      debugInfo.databaseOperations = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    logger.error('Debug API error:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
