import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client with proper configuration
 * Handles both regular database connections and Prisma Accelerate
 */
const createPrismaClient = () => {
  // Prisma client initialization

  // Determine which database URL to use
  // Prisma Accelerate takes precedence if available
  const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or PRISMA_DATABASE_URL environment variable is not set');
  }

  // Check if using Prisma Accelerate
  const isUsingAccelerate = !!process.env.PRISMA_DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  // Database configuration determined

  // Configure Prisma client based on environment and connection type
  const clientConfig: {
    log: ('query' | 'info' | 'warn' | 'error')[];
    datasources?: { db: { url: string } };
  } = {
    log: isProduction
      ? ['error']
      : ['query', 'error', 'warn', 'info'],
  };

  // Add Prisma Accelerate configuration if using it
  if (isUsingAccelerate) {
    clientConfig.datasources = {
      db: {
        url: databaseUrl,
      },
    };
  }

  const client = new PrismaClient(clientConfig);

  // PrismaClient created successfully

  return client;
};

// Create or reuse existing Prisma client instance
// This prevents multiple instances in development (hot reloading)
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Store the client globally in non-production environments
// This prevents creating multiple instances during development hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export for backward compatibility
export { prisma as prismaLocal };

// Graceful shutdown handler - only in Node.js runtime, not Edge Runtime
if (typeof process !== 'undefined' && process.on && typeof process.on === 'function') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
