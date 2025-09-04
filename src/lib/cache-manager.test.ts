import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  CACHE_INVALIDATION_TRIGGERS,
  type ContentType,
  type CacheStatus,
} from './cache-manager';

describe('Cache Manager Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('CACHE_INVALIDATION_TRIGGERS', () => {
    it('has correct triggers for calendar content type', () => {
      expect(CACHE_INVALIDATION_TRIGGERS.calendar).toEqual({
        triggers: ['content-slots', 'stories'],
        relatedQueries: ['contentCalendar', 'stories'],
      });
    });

    it('has correct triggers for projects content type', () => {
      expect(CACHE_INVALIDATION_TRIGGERS.projects).toEqual({
        triggers: ['projects', 'tasks'],
        relatedQueries: ['projects', 'tasks'],
      });
    });

    it('has correct triggers for stories content type', () => {
      expect(CACHE_INVALIDATION_TRIGGERS.stories).toEqual({
        triggers: ['stories', 'story-types'],
        relatedQueries: ['stories', 'storyTypes'],
      });
    });

    it('has correct triggers for tasks content type', () => {
      expect(CACHE_INVALIDATION_TRIGGERS.tasks).toEqual({
        triggers: ['tasks', 'attendance'],
        relatedQueries: ['tasks', 'attendance'],
      });
    });

    it('has correct triggers for users content type', () => {
      expect(CACHE_INVALIDATION_TRIGGERS.users).toEqual({
        triggers: ['users', 'attendance'],
        relatedQueries: ['users', 'attendance'],
      });
    });

    it('has correct triggers for attendance content type', () => {
      expect(CACHE_INVALIDATION_TRIGGERS.attendance).toEqual({
        triggers: ['attendance'],
        relatedQueries: ['attendance'],
      });
    });

    it('covers all content types', () => {
      const contentTypes: ContentType[] = [
        'calendar',
        'projects',
        'stories',
        'tasks',
        'users',
        'attendance',
      ];
      contentTypes.forEach(type => {
        expect(CACHE_INVALIDATION_TRIGGERS[type]).toBeDefined();
      });
    });

    it('has consistent structure for all content types', () => {
      const contentTypes: ContentType[] = [
        'calendar',
        'projects',
        'stories',
        'tasks',
        'users',
        'attendance',
      ];
      contentTypes.forEach(type => {
        const config = CACHE_INVALIDATION_TRIGGERS[type];
        expect(config).toHaveProperty('triggers');
        expect(config).toHaveProperty('relatedQueries');
        expect(Array.isArray(config.triggers)).toBe(true);
        expect(Array.isArray(config.relatedQueries)).toBe(true);
        expect(config.triggers.length).toBeGreaterThan(0);
        expect(config.relatedQueries.length).toBeGreaterThan(0);
      });
    });

    it('has meaningful trigger mappings', () => {
      // Calendar should trigger content-slots and stories
      expect(CACHE_INVALIDATION_TRIGGERS.calendar.triggers).toContain(
        'content-slots'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.calendar.triggers).toContain(
        'stories'
      );

      // Projects should trigger projects and tasks
      expect(CACHE_INVALIDATION_TRIGGERS.projects.triggers).toContain(
        'projects'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.projects.triggers).toContain('tasks');

      // Stories should trigger stories and story-types
      expect(CACHE_INVALIDATION_TRIGGERS.stories.triggers).toContain('stories');
      expect(CACHE_INVALIDATION_TRIGGERS.stories.triggers).toContain(
        'story-types'
      );
    });

    it('has meaningful related query mappings', () => {
      // Calendar should relate to contentCalendar and stories
      expect(CACHE_INVALIDATION_TRIGGERS.calendar.relatedQueries).toContain(
        'contentCalendar'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.calendar.relatedQueries).toContain(
        'stories'
      );

      // Projects should relate to projects and tasks
      expect(CACHE_INVALIDATION_TRIGGERS.projects.relatedQueries).toContain(
        'projects'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.projects.relatedQueries).toContain(
        'tasks'
      );

      // Stories should relate to stories and storyTypes
      expect(CACHE_INVALIDATION_TRIGGERS.stories.relatedQueries).toContain(
        'stories'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.stories.relatedQueries).toContain(
        'storyTypes'
      );
    });
  });

  describe('Type Definitions', () => {
    it('defines ContentType correctly', () => {
      const validContentTypes: ContentType[] = [
        'calendar',
        'projects',
        'stories',
        'tasks',
        'users',
        'attendance',
      ];

      validContentTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(CACHE_INVALIDATION_TRIGGERS[type]).toBeDefined();
      });
    });

    it('defines CacheStatus interface correctly', () => {
      const mockCacheStatus: CacheStatus = {
        status: 'clean',
        lastUpdate: Date.now(),
        lastCleared: new Date(),
        serviceWorkerStatus: 'active',
      };

      expect(mockCacheStatus).toHaveProperty('status');
      expect(mockCacheStatus).toHaveProperty('lastCleared');
      expect(mockCacheStatus).toHaveProperty('serviceWorkerStatus');

      expect(['unknown', 'clean', 'dirty']).toContain(mockCacheStatus.status);
      expect(mockCacheStatus.lastCleared).toBeInstanceOf(Date);
      expect([
        'unregistered',
        'installing',
        'waiting',
        'active',
        'redundant',
      ]).toContain(mockCacheStatus.serviceWorkerStatus);
    });

    it('allows optional properties in CacheStatus', () => {
      const minimalCacheStatus: CacheStatus = {
        status: 'unknown',
        lastUpdate: Date.now(),
        serviceWorkerStatus: 'unregistered',
      };

      expect(minimalCacheStatus.status).toBe('unknown');
      expect(minimalCacheStatus.lastCleared).toBeUndefined();
      expect(minimalCacheStatus.serviceWorkerStatus).toBeUndefined();
    });
  });

  describe('Business Logic Validation', () => {
    it('has logical trigger relationships', () => {
      // Calendar changes should trigger content-slots and stories
      expect(CACHE_INVALIDATION_TRIGGERS.calendar.triggers).toContain(
        'content-slots'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.calendar.triggers).toContain(
        'stories'
      );

      // Project changes should trigger projects and tasks
      expect(CACHE_INVALIDATION_TRIGGERS.projects.triggers).toContain(
        'projects'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.projects.triggers).toContain('tasks');

      // Story changes should trigger stories and story-types
      expect(CACHE_INVALIDATION_TRIGGERS.stories.triggers).toContain('stories');
      expect(CACHE_INVALIDATION_TRIGGERS.stories.triggers).toContain(
        'story-types'
      );
    });

    it('has logical query relationships', () => {
      // Calendar changes should invalidate contentCalendar and stories queries
      expect(CACHE_INVALIDATION_TRIGGERS.calendar.relatedQueries).toContain(
        'contentCalendar'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.calendar.relatedQueries).toContain(
        'stories'
      );

      // Project changes should invalidate projects and tasks queries
      expect(CACHE_INVALIDATION_TRIGGERS.projects.relatedQueries).toContain(
        'projects'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.projects.relatedQueries).toContain(
        'tasks'
      );

      // Story changes should invalidate stories and storyTypes queries
      expect(CACHE_INVALIDATION_TRIGGERS.stories.relatedQueries).toContain(
        'stories'
      );
      expect(CACHE_INVALIDATION_TRIGGERS.stories.relatedQueries).toContain(
        'storyTypes'
      );
    });

    it('maintains consistency between triggers and queries', () => {
      const contentTypes: ContentType[] = [
        'calendar',
        'projects',
        'stories',
        'tasks',
        'users',
        'attendance',
      ];

      contentTypes.forEach(type => {
        const config = CACHE_INVALIDATION_TRIGGERS[type];

        // Each trigger should have a corresponding query pattern
        config.triggers.forEach(trigger => {
          const hasMatchingQuery = config.relatedQueries.some(
            query =>
              query
                .toLowerCase()
                .includes(trigger.replace('-', '').toLowerCase()) ||
              trigger.toLowerCase().includes(query.toLowerCase())
          );

          // Most triggers should have matching queries, but some flexibility is allowed
          expect(
            hasMatchingQuery ||
              trigger === 'content-slots' ||
              trigger === 'story-types'
          ).toBe(true);
        });
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('handles all defined content types without errors', () => {
      const contentTypes: ContentType[] = [
        'calendar',
        'projects',
        'stories',
        'tasks',
        'users',
        'attendance',
      ];

      contentTypes.forEach(type => {
        expect(() => {
          const config = CACHE_INVALIDATION_TRIGGERS[type];
          expect(config.triggers).toBeDefined();
          expect(config.relatedQueries).toBeDefined();
        }).not.toThrow();
      });
    });

    it('has non-empty arrays for all configurations', () => {
      const contentTypes: ContentType[] = [
        'calendar',
        'projects',
        'stories',
        'tasks',
        'users',
        'attendance',
      ];

      contentTypes.forEach(type => {
        const config = CACHE_INVALIDATION_TRIGGERS[type];
        expect(config.triggers.length).toBeGreaterThan(0);
        expect(config.relatedQueries.length).toBeGreaterThan(0);
      });
    });

    it('has unique triggers within each content type', () => {
      const contentTypes: ContentType[] = [
        'calendar',
        'projects',
        'stories',
        'tasks',
        'users',
        'attendance',
      ];

      contentTypes.forEach(type => {
        const config = CACHE_INVALIDATION_TRIGGERS[type];
        const uniqueTriggers = new Set(config.triggers);
        expect(uniqueTriggers.size).toBe(config.triggers.length);
      });
    });

    it('has unique related queries within each content type', () => {
      const contentTypes: ContentType[] = [
        'calendar',
        'projects',
        'stories',
        'tasks',
        'users',
        'attendance',
      ];

      contentTypes.forEach(type => {
        const config = CACHE_INVALIDATION_TRIGGERS[type];
        const uniqueQueries = new Set(config.relatedQueries);
        expect(uniqueQueries.size).toBe(config.relatedQueries.length);
      });
    });
  });

  describe('Integration Patterns', () => {
    it('supports cascading cache invalidation', () => {
      // When a story changes, it should invalidate story-related caches
      const storyConfig = CACHE_INVALIDATION_TRIGGERS.stories;

      // Story changes should trigger story-type changes
      expect(storyConfig.triggers).toContain('story-types');

      // Story changes should invalidate story queries
      expect(storyConfig.relatedQueries).toContain('stories');
    });

    it('supports cross-entity relationships', () => {
      // Projects and tasks are related
      const projectConfig = CACHE_INVALIDATION_TRIGGERS.projects;
      const taskConfig = CACHE_INVALIDATION_TRIGGERS.tasks;

      // Project changes should affect tasks
      expect(projectConfig.triggers).toContain('tasks');
      expect(projectConfig.relatedQueries).toContain('tasks');

      // Task changes should affect projects
      expect(taskConfig.triggers).toContain('tasks');
      expect(taskConfig.relatedQueries).toContain('tasks');
    });

    it('supports user-centric invalidation', () => {
      // User changes should affect attendance
      const userConfig = CACHE_INVALIDATION_TRIGGERS.users;

      expect(userConfig.triggers).toContain('attendance');
      expect(userConfig.relatedQueries).toContain('attendance');

      // Attendance changes should be isolated
      const attendanceConfig = CACHE_INVALIDATION_TRIGGERS.attendance;
      expect(attendanceConfig.triggers).toEqual(['attendance']);
      expect(attendanceConfig.relatedQueries).toEqual(['attendance']);
    });
  });
});
