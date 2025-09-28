import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client with proper configuration
 * Handles both regular database connections and Prisma Accelerate
 */
const createPrismaClient = () => {
  // Determine which database URL to use
  // Prisma Accelerate takes precedence if available
  const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

  // Add diagnostic logging
  console.log('[PRISMA DEBUG] Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL ? 'SET' : 'NOT SET',
    selectedUrl: databaseUrl ? 'SET' : 'NOT SET',
  });

  if (databaseUrl) {
    console.log('[PRISMA DEBUG] Attempting to connect with DATABASE_URL:', databaseUrl.substring(0, 30) + '...');
  } else {
    console.error('[PRISMA DEBUG] !!! DATABASE_URL UNDEFINED !!!');
  }

  if (!databaseUrl) {
    console.error('[PRISMA DEBUG] ❌ No database URL found!');
    console.error('[PRISMA DEBUG] Available environment variables:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB')));
    throw new Error('DATABASE_URL or PRISMA_DATABASE_URL environment variable is not set');
  }

  // Check if using Prisma Accelerate
  const isUsingAccelerate = !!process.env.PRISMA_DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  console.log('[PRISMA DEBUG] Client configuration:', {
    isUsingAccelerate,
    isProduction,
    databaseUrlLength: databaseUrl.length,
  });

  // Configure Prisma client based on environment and connection type
  const clientConfig: {
    log: ('query' | 'info' | 'warn' | 'error')[];
    datasources?: { db: { url: string } };
  } = {
    log: isProduction
      ? ['error']
      : ['error', 'warn'],
  };

  // Always set datasource URL explicitly for consistency
  clientConfig.datasources = {
    db: {
      url: databaseUrl,
    },
  };

  console.log('[PRISMA DEBUG] Creating PrismaClient with config:', {
    hasDatasources: !!clientConfig.datasources,
    logLevels: clientConfig.log,
  });

  const client = new PrismaClient(clientConfig);
  
  // Test the connection immediately with retry
  console.log('[PRISMA DEBUG] Testing database connection...');
  
  const testConnection = async () => {
    try {
      await client.$connect();
      console.log('[PRISMA DEBUG] ✅ Database connection successful!');
    } catch (error) {
      console.error('[PRISMA DEBUG] ❌ Database connection failed:', error);
      console.error('[PRISMA DEBUG] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        meta: (error as any)?.meta,
      });
      
      // Don't throw here, let the actual query handle the error
      console.log('[PRISMA DEBUG] Connection test failed, but client will be returned for retry');
    }
  };
  
  // Test connection asynchronously
  testConnection();
  
  return client;
};

// Create or reuse existing Prisma client instance
// This prevents multiple instances in development (hot reloading)
let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  console.log('[PRISMA DEBUG] Using existing global Prisma client');
  prisma = globalForPrisma.prisma;
} else {
  console.log('[PRISMA DEBUG] Creating new Prisma client');
  prisma = createPrismaClient();
  
  // Store the client globally in non-production environments
  // This prevents creating multiple instances during development hot reloads
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };

// Export for backward compatibility
export { prisma as prismaLocal };

// Graceful shutdown handler - only in Node.js runtime, not Edge Runtime
if (typeof process !== 'undefined' && process.on && typeof process.on === 'function' && typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
