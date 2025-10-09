/**
 * Database Pagination Utilities
 * Provides consistent pagination patterns across all API endpoints
 */

import { Prisma } from '@prisma/client';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Parse pagination parameters from URL search params
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  const search = searchParams.get('search')?.trim() || undefined;

  // Parse filters from query params
  const filters: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '');
      filters[filterKey] = value;
    }
  });

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  };
}

/**
 * Create Prisma pagination options
 */
export function createPaginationOptions(params: PaginationParams) {
  const skip = (params.page - 1) * params.limit;
  
  return {
    skip,
    take: params.limit,
    orderBy: params.sortBy ? {
      [params.sortBy]: params.sortOrder,
    } as any : undefined,
  };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Create search conditions for common fields
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

/**
 * Create status filter
 */
export function createStatusFilter(
  status?: string,
  validStatuses?: string[]
): Record<string, any> | undefined {
  if (!status) return undefined;
  
  if (validStatuses && !validStatuses.includes(status)) {
    return undefined;
  }

  return { status };
}

/**
 * Generic paginated query helper
 */
export async function executePaginatedQuery<T, Where, OrderBy>(
  model: {
    findMany: (args: {
      where?: Where;
      orderBy?: OrderBy;
      skip?: number;
      take?: number;
      include?: any;
      select?: any;
    }) => Promise<T[]>;
    count: (args: { where?: Where }) => Promise<number>;
  },
  params: PaginationParams,
  where?: Where,
  include?: any,
  select?: any
): Promise<PaginationResult<T>> {
  const paginationOptions = createPaginationOptions(params);
  
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      select,
      ...paginationOptions,
    }),
    model.count({ where }),
  ]);

  const pagination = calculatePaginationMeta(
    params.page,
    params.limit,
    total
  );

  return {
    data,
    pagination,
  };
}

/**
 * Create optimized select fields for common entities
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
    description: true,
    status: true,
    startDate: true,
    endDate: true,
  },
  task: {
    id: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    dueDate: true,
    createdAt: true,
    updatedAt: true,
  },
  story: {
    id: true,
    title: true,
    content: true,
    day: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  },
  meeting: {
    id: true,
    title: true,
    startTime: true,
    endTime: true,
    type: true,
    status: true,
    createdAt: true,
  },
} as const;

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: Partial<PaginationParams>): PaginationParams {
  return {
    page: Math.max(1, params.page || 1),
    limit: Math.min(100, Math.max(1, params.limit || 10)),
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder === 'asc' || params.sortOrder === 'desc') ? params.sortOrder : 'desc',
    search: params.search,
    filters: params.filters,
  };
}

/**
 * Create cursor-based pagination for large datasets
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor?: string;
  hasNext: boolean;
}

export function createCursorPaginationOptions(params: CursorPaginationParams) {
  const take = Math.min(100, Math.max(1, params.limit));
  
  const orderBy = {
    [params.sortBy]: params.sortOrder,
  };

  const where = params.cursor ? {
    [params.sortBy]: params.sortOrder === 'asc' 
      ? { gt: params.cursor }
      : { lt: params.cursor },
  } : undefined;

  return {
    take: take + 1, // Take one extra to check if there's a next page
    orderBy,
    where,
  };
}

export function processCursorPaginationResult<T>(
  data: T[],
  limit: number,
  sortBy: string
): CursorPaginationResult<T> {
  const hasNext = data.length > limit;
  const result = hasNext ? data.slice(0, limit) : data;
  
  const nextCursor = hasNext && result.length > 0 
    ? (result[result.length - 1] as any)[sortBy]?.toString()
    : undefined;

  return {
    data: result,
    nextCursor,
    hasNext,
  };
}
