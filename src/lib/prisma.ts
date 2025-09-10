import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with extensive debugging
const createPrismaClient = () => {
  try {
    console.log('🔍 [PRISMA DEBUG] Starting Prisma client creation...');
    console.log('🔍 [PRISMA DEBUG] process.env.DATABASE_URL:', process.env.DATABASE_URL);
    console.log('🔍 [PRISMA DEBUG] process.env.NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 [PRISMA DEBUG] All environment variables:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('POSTGRES')));
    
    // Use environment variable for database URL
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('🔍 [PRISMA DEBUG] Using DATABASE_URL from environment:', databaseUrl);
    console.log('🔍 [PRISMA DEBUG] Creating PrismaClient with environment URL...');

    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn', 'info'] : ['error'],
    });

    console.log('✅ [PRISMA DEBUG] PrismaClient created successfully');
    return client;
  } catch (error) {
    console.error('❌ [PRISMA DEBUG] Failed to create Prisma client:', error);
    console.error('❌ [PRISMA DEBUG] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    throw error;
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;