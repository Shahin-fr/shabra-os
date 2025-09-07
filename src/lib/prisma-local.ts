import { PrismaClient } from '@prisma/client';

// Create a local Prisma client that always uses the local SQLite database
export const prismaLocal = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prismaLocal.$disconnect();
});
