import { z } from 'zod';

/**
 * Project validation schemas
 * Centralized Zod schemas for project-related operations
 */

// Base project schema with common fields
const BaseProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be one of: ACTIVE, INACTIVE, COMPLETED, CANCELLED' })
  }).default('ACTIVE'),
  startDate: z.string().datetime('Invalid start date format').optional().or(z.literal('')),
  endDate: z.string().datetime('Invalid end date format').optional().or(z.literal('')),
  accessLevel: z.enum(['PUBLIC', 'PRIVATE'], {
    errorMap: () => ({ message: 'Access level must be either PUBLIC or PRIVATE' })
  }).default('PRIVATE'),
});

// Schema for creating a new project
export const CreateProjectSchema = BaseProjectSchema;

// Schema for updating a project (all fields optional except validation rules)
export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty').max(255, 'Project name must be less than 255 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be one of: ACTIVE, INACTIVE, COMPLETED, CANCELLED' })
  }).optional(),
  startDate: z.string().datetime('Invalid start date format').optional().or(z.literal('')),
  endDate: z.string().datetime('Invalid end date format').optional().or(z.literal('')),
  accessLevel: z.enum(['PUBLIC', 'PRIVATE'], {
    errorMap: () => ({ message: 'Access level must be either PUBLIC or PRIVATE' })
  }).optional(),
});

// Schema for query parameters when fetching projects
export const GetProjectsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a positive number').optional().default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive number').optional().default('20'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  search: z.string().min(1, 'Search term cannot be empty').max(100, 'Search term must be less than 100 characters').optional(),
});

// Schema for path parameters
export const ProjectIdParamSchema = z.object({
  projectId: z.string().cuid('Invalid project ID format'),
});

// Schema for project statistics query
export const ProjectStatsQuerySchema = z.object({
  projectId: z.string().cuid('Invalid project ID format'),
});

// Schema for project search query
export const ProjectSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive number').transform(Number).refine(n => n > 0 && n <= 50, 'Limit must be between 1 and 50').optional().default('10'),
});

// Type exports for TypeScript
export type CreateProjectData = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectData = z.infer<typeof UpdateProjectSchema>;
export type GetProjectsQuery = {
  page?: string;
  limit?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';
  search?: string;
};
export type ProjectIdParam = z.infer<typeof ProjectIdParamSchema>;
export type ProjectStatsQuery = z.infer<typeof ProjectStatsQuerySchema>;
export type ProjectSearchQuery = z.infer<typeof ProjectSearchQuerySchema>;

/**
 * Validation helper functions
 */
export const validateCreateProject = (data: unknown) => CreateProjectSchema.parse(data);
export const validateUpdateProject = (data: unknown) => UpdateProjectSchema.parse(data);
export const validateGetProjectsQuery = (data: unknown) => GetProjectsQuerySchema.parse(data);
export const validateProjectIdParam = (data: unknown) => ProjectIdParamSchema.parse(data);
export const validateProjectStatsQuery = (data: unknown) => ProjectStatsQuerySchema.parse(data);
export const validateProjectSearchQuery = (data: unknown) => ProjectSearchQuerySchema.parse(data);

/**
 * Safe validation functions that return results instead of throwing
 */
export const safeValidateCreateProject = (data: unknown) => CreateProjectSchema.safeParse(data);
export const safeValidateUpdateProject = (data: unknown) => UpdateProjectSchema.safeParse(data);
export const safeValidateGetProjectsQuery = (data: unknown) => GetProjectsQuerySchema.safeParse(data);
export const safeValidateProjectIdParam = (data: unknown) => ProjectIdParamSchema.safeParse(data);
export const safeValidateProjectStatsQuery = (data: unknown) => ProjectStatsQuerySchema.safeParse(data);
export const safeValidateProjectSearchQuery = (data: unknown) => ProjectSearchQuerySchema.safeParse(data);
