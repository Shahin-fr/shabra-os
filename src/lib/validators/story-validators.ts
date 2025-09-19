import { z } from 'zod';

/**
 * Story validation schemas
 * Centralized Zod schemas for story-related operations
 */

// Base story schema with common fields
const BaseStorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  notes: z.string().optional(),
  visualNotes: z.string().optional(),
  link: z.string().url('Invalid URL format').optional().or(z.literal('')),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Day must be in YYYY-MM-DD format'),
  order: z.number().int().min(0, 'Order must be a positive number').optional().default(0),
  status: z.enum(['DRAFT', 'READY', 'PUBLISHED'], {
    errorMap: () => ({ message: 'Status must be one of: DRAFT, READY, PUBLISHED' })
  }).optional().default('DRAFT'),
  projectId: z.string().cuid('Invalid project ID format'),
  storyTypeId: z.string().cuid('Invalid story type ID format'),
  storyIdeaId: z.string().cuid('Invalid story idea ID format').optional(),
  customTitle: z.string().max(255, 'Custom title must be less than 255 characters').optional(),
  type: z.string().max(100, 'Type must be less than 100 characters').optional(),
  ideaId: z.string().cuid('Invalid idea ID format').optional(),
});

// Schema for creating a new story
export const CreateStorySchema = BaseStorySchema;

// Schema for updating a story (all fields optional except validation rules)
export const UpdateStorySchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(255, 'Title must be less than 255 characters').optional(),
  notes: z.string().optional(),
  visualNotes: z.string().optional(),
  link: z.string().url('Invalid URL format').optional().or(z.literal('')),
  order: z.number().int().min(0, 'Order must be a positive number').optional(),
  status: z.enum(['DRAFT', 'READY', 'PUBLISHED'], {
    errorMap: () => ({ message: 'Status must be one of: DRAFT, READY, PUBLISHED' })
  }).optional(),
  storyTypeId: z.string().cuid('Invalid story type ID format').optional(),
  storyIdeaId: z.string().cuid('Invalid story idea ID format').optional(),
});

// Schema for story reordering
export const ReorderStoriesSchema = z.object({
  stories: z
    .array(
      z.object({
        id: z.string().cuid('Invalid story ID format'),
      })
    )
    .min(1, 'At least one story is required for reordering'),
});

// Schema for query parameters when fetching stories
export const GetStoriesQuerySchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Day must be in YYYY-MM-DD format'),
  projectId: z.string().cuid('Invalid project ID format').optional(),
  status: z.enum(['DRAFT', 'READY', 'PUBLISHED']).optional(),
  storyTypeId: z.string().cuid('Invalid story type ID format').optional(),
});

// Schema for path parameters
export const StoryIdParamSchema = z.object({
  storyId: z.string().cuid('Invalid story ID format'),
});

// Type exports for TypeScript
export type CreateStoryData = z.infer<typeof CreateStorySchema>;
export type UpdateStoryData = z.infer<typeof UpdateStorySchema>;
export type ReorderStoriesData = z.infer<typeof ReorderStoriesSchema>;
export type GetStoriesQuery = z.infer<typeof GetStoriesQuerySchema>;
export type StoryIdParam = z.infer<typeof StoryIdParamSchema>;

/**
 * Validation helper functions
 */
export const validateCreateStory = (data: unknown) => CreateStorySchema.parse(data);
export const validateUpdateStory = (data: unknown) => UpdateStorySchema.parse(data);
export const validateReorderStories = (data: unknown) => ReorderStoriesSchema.parse(data);
export const validateGetStoriesQuery = (data: unknown) => GetStoriesQuerySchema.parse(data);
export const validateStoryIdParam = (data: unknown) => StoryIdParamSchema.parse(data);

/**
 * Safe validation functions that return results instead of throwing
 */
export const safeValidateCreateStory = (data: unknown) => CreateStorySchema.safeParse(data);
export const safeValidateUpdateStory = (data: unknown) => UpdateStorySchema.safeParse(data);
export const safeValidateReorderStories = (data: unknown) => ReorderStoriesSchema.safeParse(data);
export const safeValidateGetStoriesQuery = (data: unknown) => GetStoriesQuerySchema.safeParse(data);
export const safeValidateStoryIdParam = (data: unknown) => StoryIdParamSchema.safeParse(data);
