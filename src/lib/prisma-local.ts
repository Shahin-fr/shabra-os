/**
 * Prisma Local Client
 * This is an alias for the main Prisma client to maintain compatibility
 * with existing API routes that import from '@/lib/prisma-local'
 */

import { prisma } from './prisma';

// Export the main Prisma client as prismaLocal for backward compatibility
export const prismaLocal = prisma;

// Also export as prisma for consistency
export { prisma };
