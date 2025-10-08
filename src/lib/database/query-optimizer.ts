/**
 * Simple database query utilities
 */

import { Prisma } from '@prisma/client';

/**
 * Common select fields for optimized queries
 */
export const CommonSelects = {
  user: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    avatar: true,
    isActive: true,
  },
  userMinimal: {
    id: true,
    firstName: true,
    lastName: true,
    avatar: true,
  },
  project: {
    id: true,
    name: true,
    status: true,
  },
} as const;

/**
 * Create search conditions for text fields
 */
export function createSearchConditions(
  search: string,
  searchFields: string[]
): Record<string, any> | undefined {
  if (!search || search.length < 2) return undefined;

  const sanitizedSearch = search.replace(/[<>"'%;()&+]/g, '');
  
  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: sanitizedSearch,
        mode: 'insensitive' as const,
      },
    })),
  };
}

/**
 * Create date range filter
 */
export function createDateRangeFilter(
  startDate?: string,
  endDate?: string,
  field: string = 'createdAt'
): Prisma.DateTimeFilter | undefined {
  if (!startDate && !endDate) return undefined;

  const filter: Prisma.DateTimeFilter = {};
  
  if (startDate) {
    filter.gte = new Date(startDate);
  }
  
  if (endDate) {
    filter.lte = new Date(endDate);
  }

  return filter;
}