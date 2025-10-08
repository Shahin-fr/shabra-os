import { describe, it, expect, beforeEach } from 'vitest';
import {
  parsePaginationParams,
  createPaginationOptions,
  calculatePaginationMeta,
  createSearchConditions,
  createDateRangeFilter,
  createStatusFilter,
  validatePaginationParams,
} from '../pagination';

describe('Pagination Utilities', () => {
  describe('parsePaginationParams', () => {
    it('should parse basic pagination parameters', () => {
      const searchParams = new URLSearchParams({
        page: '2',
        limit: '20',
        sortBy: 'createdAt',
        sortOrder: 'asc',
        search: 'test',
      });

      const result = parsePaginationParams(searchParams);

      expect(result).toEqual({
        page: 2,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'asc',
        search: 'test',
        filters: undefined,
      });
    });

    it('should handle missing parameters with defaults', () => {
      const searchParams = new URLSearchParams();

      const result = parsePaginationParams(searchParams);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        sortBy: undefined,
        sortOrder: 'desc',
        search: undefined,
        filters: undefined,
      });
    });

    it('should enforce minimum and maximum limits', () => {
      const searchParams = new URLSearchParams({
        page: '0',
        limit: '200',
      });

      const result = parsePaginationParams(searchParams);

      expect(result.page).toBe(1); // Minimum page is 1
      expect(result.limit).toBe(100); // Maximum limit is 100
    });

    it('should parse filter parameters', () => {
      const searchParams = new URLSearchParams({
        filter_status: 'active',
        filter_category: 'test',
        filter_type: 'user',
      });

      const result = parsePaginationParams(searchParams);

      expect(result.filters).toEqual({
        status: 'active',
        category: 'test',
        type: 'user',
      });
    });
  });

  describe('createPaginationOptions', () => {
    it('should create correct Prisma pagination options', () => {
      const params = {
        page: 3,
        limit: 15,
        sortBy: 'name',
        sortOrder: 'asc' as const,
      };

      const result = createPaginationOptions(params);

      expect(result).toEqual({
        skip: 30, // (3 - 1) * 15
        take: 15,
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('should handle missing sortBy', () => {
      const params = {
        page: 1,
        limit: 10,
      };

      const result = createPaginationOptions(params);

      expect(result).toEqual({
        skip: 0,
        take: 10,
        orderBy: undefined,
      });
    });
  });

  describe('calculatePaginationMeta', () => {
    it('should calculate pagination metadata correctly', () => {
      const result = calculatePaginationMeta(3, 10, 25);

      expect(result).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should handle edge cases', () => {
      const result = calculatePaginationMeta(1, 10, 0);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('createSearchConditions', () => {
    it('should create search conditions for multiple fields', () => {
      const result = createSearchConditions('test query', ['title', 'content']);

      expect(result).toEqual({
        OR: [
          {
            title: {
              contains: 'test query',
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: 'test query',
              mode: 'insensitive',
            },
          },
        ],
      });
    });

    it('should return undefined for short search terms', () => {
      const result = createSearchConditions('a', ['title']);

      expect(result).toBeUndefined();
    });

    it('should sanitize search input', () => {
      const result = createSearchConditions('test<script>', ['title']);

      expect(result?.OR[0].title.contains).toBe('testscript');
    });
  });

  describe('createDateRangeFilter', () => {
    it('should create date range filter with start and end dates', () => {
      const result = createDateRangeFilter('2023-01-01', '2023-12-31');

      expect(result).toEqual({
        gte: new Date('2023-01-01'),
        lte: new Date('2023-12-31'),
      });
    });

    it('should create filter with only start date', () => {
      const result = createDateRangeFilter('2023-01-01');

      expect(result).toEqual({
        gte: new Date('2023-01-01'),
      });
    });

    it('should create filter with only end date', () => {
      const result = createDateRangeFilter(undefined, '2023-12-31');

      expect(result).toEqual({
        lte: new Date('2023-12-31'),
      });
    });

    it('should return undefined when no dates provided', () => {
      const result = createDateRangeFilter();

      expect(result).toBeUndefined();
    });
  });

  describe('createStatusFilter', () => {
    it('should create status filter for valid status', () => {
      const result = createStatusFilter('active', ['active', 'inactive']);

      expect(result).toEqual({ status: 'active' });
    });

    it('should return undefined for invalid status', () => {
      const result = createStatusFilter('invalid', ['active', 'inactive']);

      expect(result).toBeUndefined();
    });

    it('should return undefined when no status provided', () => {
      const result = createStatusFilter();

      expect(result).toBeUndefined();
    });
  });

  describe('validatePaginationParams', () => {
    it('should validate and normalize pagination parameters', () => {
      const params = {
        page: 0,
        limit: 200,
        sortOrder: 'invalid' as any,
      };

      const result = validatePaginationParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 100,
        sortBy: undefined,
        sortOrder: 'desc',
        search: undefined,
        filters: undefined,
      });
    });
  });
});
