import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if we have a valid database URL
const hasValidDatabaseUrl = process.env.DATABASE_URL && 
  process.env.DATABASE_URL !== 'undefined' && 
  (process.env.DATABASE_URL.startsWith('postgresql://') || 
   process.env.DATABASE_URL.startsWith('postgres://')) &&
  !process.env.DATABASE_URL.includes('mock://');

// Create a mock Prisma client for build time when no database is available
const createMockPrismaClient = () => {
  return {
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    $queryRaw: () => Promise.resolve([]),
    $executeRaw: () => Promise.resolve(0),
    $transaction: (fn: (tx: any) => any) => fn(createMockPrismaClient()),
    user: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    project: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    task: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    story: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    storyType: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    storyIdea: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    contentSlot: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    document: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    idea: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    leaveRequest: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
    attendance: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 'mock-id' }),
      update: () => Promise.resolve({ id: 'mock-id' }),
      delete: () => Promise.resolve({ id: 'mock-id' }),
      count: () => Promise.resolve(0),
    },
  } as any;
};

export const prisma = globalForPrisma.prisma ?? (
  hasValidDatabaseUrl 
    ? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      })
    : createMockPrismaClient()
);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
