import { DatabasePerformanceMonitor } from '@/lib/database/query-optimizer';
import { StoryQueryOptimizer } from '@/lib/database/query-optimizer';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { ProjectIdResolver } from '@/lib/utils/ProjectIdResolver';
import {
  CreateStorySchema,
  UpdateStorySchema,
  UpdateStoryData,
} from '@/lib/validators/story-validators';

/**
 * Story Service
 * Contains all business logic related to story operations
 */
export class StoryService {
  /**
   * Get stories for a specific day
   */
  static async getStoriesByDay(day: string) {
    // Validate day format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(day)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    // Use optimized query with performance monitoring
    const result = await DatabasePerformanceMonitor.monitorQueryPerformance(
      'getStoriesByDay',
      () => StoryQueryOptimizer.getStoriesByDay(day)
    );

    return result.result;
  }

  /**
   * Get a story by ID with all related data
   */
  static async getStoryById(storyId: string) {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        storyType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        storyIdea: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            storyType: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    return story;
  }

  /**
   * Create a new story
   */
  static async createStory(data: any) {

    // Validate input data
    const validatedData = CreateStorySchema.parse(data);

    // Resolve project ID using the utility class
    const resolvedProjectId = await ProjectIdResolver.resolve(validatedData.projectId);
    if (!resolvedProjectId) {
      throw new Error('Invalid project ID provided');
    }
    const projectId = resolvedProjectId;

    // Fix story idea ID if needed
    let storyIdeaId = validatedData.storyIdeaId;
    if (storyIdeaId && storyIdeaId.length > 0) {
      const storyIdea = await prisma.storyIdea.findFirst({
        where: {
          OR: [{ id: storyIdeaId }, { title: storyIdeaId }],
        },
        select: { id: true, title: true },
      });

      if (storyIdea) {
        storyIdeaId = storyIdea.id;
        // Story idea ID fixed for compatibility
      } else {
        // Story idea not found, will be set to null
        storyIdeaId = undefined;
      }
    }

    // Use database transaction for atomic story creation
    const result = await DatabasePerformanceMonitor.monitorQueryPerformance(
      'createStory',
      () =>
        prisma.$transaction(async (tx) => {
          // Create the story
          const story = await tx.story.create({
            data: {
              title: validatedData.title.trim(),
              content:
                validatedData.notes?.trim() || 
                validatedData.visualNotes?.trim() || 
                validatedData.link?.trim() || '',
              notes: validatedData.notes?.trim() || null,
              visualNotes: validatedData.visualNotes?.trim() || null,
              link: validatedData.link?.trim() || null,
              day: validatedData.day,
              order: validatedData.order,
              status: validatedData.status,
              projectId,
              storyTypeId: validatedData.storyTypeId,
              storyIdeaId: storyIdeaId || null,
              customTitle: validatedData.customTitle?.trim() || null,
              type: validatedData.type?.trim() || null,
              ideaId: validatedData.ideaId || null,
              authorId: data.authorId,
            },
            include: {
              storyType: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
              storyIdea: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  category: true,
                  storyType: true,
                  template: true,
                  guidelines: true,
                  icon: true,
                },
              },
            },
          });

          // Update project's last activity timestamp
          if (projectId) {
            await tx.project.update({
              where: { id: projectId },
              data: { updatedAt: new Date() },
            });
          }

          return story;
        })
    );

    logger.info('Story created successfully', {
      storyId: result.result?.id,
      authorId: data.authorId,
      operation: 'StoryService.createStory',
    });

    return result.result;
  }

  /**
   * Update a story
   */
  static async updateStory(storyId: string, data: UpdateStoryData) {
    // Validate input data
    const validatedData = UpdateStorySchema.parse(data);

    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!existingStory) {
      throw new Error('Story not found');
    }

    // Prepare update data
    const updateData: {
      title?: string;
      notes?: string | null;
      visualNotes?: string | null;
      link?: string | null;
      storyTypeId?: string | null;
      storyIdeaId?: string | null;
      order?: number;
      status?: string;
    } = {};

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title.trim();
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes?.trim() || null;
    }

    if (validatedData.visualNotes !== undefined) {
      updateData.visualNotes = validatedData.visualNotes?.trim() || null;
    }

    if (validatedData.link !== undefined) {
      updateData.link = validatedData.link?.trim() || null;
    }

    if (validatedData.storyTypeId !== undefined) {
      if (validatedData.storyTypeId) {
        // Verify story type exists
        const storyType = await prisma.storyType.findUnique({
          where: { id: validatedData.storyTypeId },
        });

        if (!storyType) {
          throw new Error('Story type not found');
        }
      }
      updateData.storyTypeId = validatedData.storyTypeId || null;
    }

    if (validatedData.storyIdeaId !== undefined) {
      if (validatedData.storyIdeaId) {
        // Check if storyIdeaId is actually a story idea name
        const storyIdea = await prisma.storyIdea.findFirst({
          where: {
            OR: [{ id: validatedData.storyIdeaId }, { title: validatedData.storyIdeaId }],
          },
          select: { id: true, title: true },
        });

        if (storyIdea) {
          updateData.storyIdeaId = storyIdea.id;
          // Story idea ID fixed for compatibility
        } else {
          // Story idea not found, will be set to null
          updateData.storyIdeaId = null;
        }
      } else {
        updateData.storyIdeaId = null;
      }
    }

    if (validatedData.order !== undefined) {
      updateData.order = validatedData.order;
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    // Update the story
    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: updateData,
      include: {
        storyType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        storyIdea: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            storyType: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info('Story updated successfully', {
      storyId,
      operation: 'StoryService.updateStory',
    });

    return updatedStory;
  }

  /**
   * Delete a story
   */
  static async deleteStory(storyId: string) {
    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!existingStory) {
      throw new Error('Story not found');
    }

    // Delete the story
    await prisma.story.delete({
      where: { id: storyId },
    });

    logger.info('Story deleted successfully', {
      storyId,
      operation: 'StoryService.deleteStory',
    });

    return { success: true, deletedId: storyId };
  }

  /**
   * Reorder stories
   */
  static async reorderStories(storyIds: string[]) {
    // Verify that all stories exist
    const existingStories = await prisma.story.findMany({
      where: {
        id: { in: storyIds },
      },
      select: { id: true },
    });

    if (existingStories.length !== storyIds.length) {
      throw new Error('Some stories not found');
    }

    // Update story orders in a transaction
    const updatedStories = await prisma.$transaction(async (tx) => {
      const updates = storyIds.map((id, index) =>
        tx.story.update({
          where: { id },
          data: {
            order: index + 1, // Set order based on array position
          },
        })
      );

      return Promise.all(updates);
    });

    logger.info('Stories reordered successfully', {
      storyCount: storyIds.length,
      operation: 'StoryService.reorderStories',
    });

    return updatedStories;
  }
}
