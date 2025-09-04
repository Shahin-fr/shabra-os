import { prisma } from './prisma';

import { logDB, logError } from '@/lib/logger';

export async function testPrismaConnection() {
  try {
    logDB('Testing Prisma connection...');

    // Test basic connection
    await prisma.$connect();
    logDB('Prisma connection successful');

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logDB('Database query successful', { result });

    // Test user count query
    const userCount = await prisma.user.count();
    logDB('User count query successful', { userCount });

    logDB('All tests passed!');

    await prisma.$disconnect();
  } catch (error) {
    logError(
      'Connection test failed',
      error instanceof Error ? error : new Error(String(error)),
      {
        context: 'prisma-connection-test',
      }
    );
    throw error;
  }
}
