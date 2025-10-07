/**
 * Zod validation schemas for Shabra OS entities
 * Provides type-safe validation for all entities and DTOs
 */

import { z } from 'zod';
import { BaseEntitySchema, BaseDTOSchema, BaseCreateDTOSchema, BaseUpdateDTOSchema } from './validation';

// Common field schemas
export const EmailSchema = z.string().email('Invalid email format');
export const NameSchema = z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters');
export const PasswordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const CuidSchema = z.string().cuid();
export const ISODateSchema = z.string().datetime();
export const DateSchema = z.date();

// User schemas
export const UserEntitySchema = BaseEntitySchema.extend({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema,
  roles: z.string().min(1, 'Roles are required'),
  isActive: z.boolean(),
  avatar: z.string().url().optional(),
  lastLogin: DateSchema.optional(),
});

export const UserDTOSchema = BaseDTOSchema.extend({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema,
  roles: z.string().min(1, 'Roles are required'),
  isActive: z.boolean(),
  avatar: z.string().url().optional(),
  lastLogin: ISODateSchema.optional(),
});

export const CreateUserDTOSchema = BaseCreateDTOSchema.extend({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema,
  roles: z.string().min(1, 'Roles are required'),
  isActive: z.boolean().default(true),
  avatar: z.string().url().optional(),
});

export const UpdateUserDTOSchema = BaseUpdateDTOSchema.extend({
  firstName: NameSchema.optional(),
  lastName: NameSchema.optional(),
  email: EmailSchema.optional(),
  roles: z.string().min(1, 'Roles are required').optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().url().optional(),
});

// Wiki Item schemas
export const WikiItemTypeSchema = z.enum(['FOLDER', 'DOCUMENT']);
export const WikiItemEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: WikiItemTypeSchema,
  parentId: CuidSchema.nullable(),
  content: z.string().nullable().optional(),
  authorId: CuidSchema,
  isPublic: z.boolean(),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().optional(),
  fileType: z.string().optional(),
  originalName: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format').optional(),
  originalSlug: z.string().optional(),
  date: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tags: z.array(z.string()).optional(),
});

export const WikiItemDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: WikiItemTypeSchema,
  parentId: CuidSchema.nullable(),
  content: z.string().nullable().optional(),
  authorId: CuidSchema,
  isPublic: z.boolean(),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().optional(),
  fileType: z.string().optional(),
  originalName: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format').optional(),
  originalSlug: z.string().optional(),
  date: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tags: z.array(z.string()).optional(),
});

export const CreateWikiItemDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: WikiItemTypeSchema,
  parentId: CuidSchema.nullable().optional(),
  content: z.string().nullable().optional(),
  authorId: CuidSchema,
  isPublic: z.boolean().default(false),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().optional(),
  fileType: z.string().optional(),
  originalName: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format').optional(),
  originalSlug: z.string().optional(),
  date: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateWikiItemDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  type: WikiItemTypeSchema.optional(),
  parentId: CuidSchema.nullable().optional(),
  content: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().optional(),
  fileType: z.string().optional(),
  originalName: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format').optional(),
  originalSlug: z.string().optional(),
  date: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tags: z.array(z.string()).optional(),
});

// Story schemas
export const StoryEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  storyType: z.string().min(1, 'Story type is required'),
  template: z.string().min(1, 'Template is required'),
  guidelines: z.string().min(1, 'Guidelines are required'),
  icon: z.string().optional(),
  isActive: z.boolean(),
  authorId: CuidSchema,
  storyIdeaId: CuidSchema.optional(),
});

export const StoryDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  storyType: z.string().min(1, 'Story type is required'),
  template: z.string().min(1, 'Template is required'),
  guidelines: z.string().min(1, 'Guidelines are required'),
  icon: z.string().optional(),
  isActive: z.boolean(),
  authorId: CuidSchema,
  storyIdeaId: CuidSchema.optional(),
});

export const CreateStoryDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  storyType: z.string().min(1, 'Story type is required'),
  template: z.string().min(1, 'Template is required'),
  guidelines: z.string().min(1, 'Guidelines are required'),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  authorId: CuidSchema,
  storyIdeaId: CuidSchema.optional(),
});

export const UpdateStoryDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  storyType: z.string().min(1, 'Story type is required').optional(),
  template: z.string().min(1, 'Template is required').optional(),
  guidelines: z.string().min(1, 'Guidelines are required').optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  storyIdeaId: CuidSchema.optional(),
});

// Story Idea schemas
export const StoryIdeaEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  storyType: z.string().min(1, 'Story type is required'),
  template: z.string().min(1, 'Template is required'),
  guidelines: z.string().min(1, 'Guidelines are required'),
  icon: z.string().optional(),
  isActive: z.boolean(),
});

export const StoryIdeaDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  storyType: z.string().min(1, 'Story type is required'),
  template: z.string().min(1, 'Template is required'),
  guidelines: z.string().min(1, 'Guidelines are required'),
  icon: z.string().optional(),
  isActive: z.boolean(),
});

export const CreateStoryIdeaDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  storyType: z.string().min(1, 'Story type is required'),
  template: z.string().min(1, 'Template is required'),
  guidelines: z.string().min(1, 'Guidelines are required'),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateStoryIdeaDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  storyType: z.string().min(1, 'Story type is required').optional(),
  template: z.string().min(1, 'Template is required').optional(),
  guidelines: z.string().min(1, 'Guidelines are required').optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Meeting schemas
export const MeetingStatusSchema = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']);
export const MeetingPrioritySchema = z.enum(['low', 'medium', 'high']);

export const MeetingEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startTime: DateSchema,
  endTime: DateSchema,
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  meetingUrl: z.string().url().optional(),
  organizerId: CuidSchema,
  attendees: z.array(CuidSchema),
  status: MeetingStatusSchema,
  priority: MeetingPrioritySchema,
  actionItemsCount: z.number().int().min(0),
});

export const MeetingDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startTime: ISODateSchema,
  endTime: ISODateSchema,
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  meetingUrl: z.string().url().optional(),
  organizerId: CuidSchema,
  attendees: z.array(CuidSchema),
  status: MeetingStatusSchema,
  priority: MeetingPrioritySchema,
  actionItemsCount: z.number().int().min(0),
});

export const CreateMeetingDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startTime: ISODateSchema,
  endTime: ISODateSchema,
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  meetingUrl: z.string().url().optional(),
  organizerId: CuidSchema,
  attendees: z.array(CuidSchema),
  status: MeetingStatusSchema.default('scheduled'),
  priority: MeetingPrioritySchema.default('medium'),
});

export const UpdateMeetingDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startTime: ISODateSchema.optional(),
  endTime: ISODateSchema.optional(),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  meetingUrl: z.string().url().optional(),
  attendees: z.array(CuidSchema).optional(),
  status: MeetingStatusSchema.optional(),
  priority: MeetingPrioritySchema.optional(),
});

// Project schemas
export const ProjectStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']);
export const ProjectAccessLevelSchema = z.enum(['PUBLIC', 'PRIVATE', 'RESTRICTED']);

export const ProjectEntitySchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: ProjectStatusSchema,
  accessLevel: ProjectAccessLevelSchema,
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
  managerId: CuidSchema,
  teamMembers: z.array(CuidSchema),
  budget: z.number().min(0).optional(),
  progress: z.number().min(0).max(100),
});

export const ProjectDTOSchema = BaseDTOSchema.extend({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: ProjectStatusSchema,
  accessLevel: ProjectAccessLevelSchema,
  startDate: ISODateSchema.optional(),
  endDate: ISODateSchema.optional(),
  managerId: CuidSchema,
  teamMembers: z.array(CuidSchema),
  budget: z.number().min(0).optional(),
  progress: z.number().min(0).max(100),
});

export const CreateProjectDTOSchema = BaseCreateDTOSchema.extend({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: ProjectStatusSchema.default('ACTIVE'),
  accessLevel: ProjectAccessLevelSchema.default('PRIVATE'),
  startDate: ISODateSchema.optional(),
  endDate: ISODateSchema.optional(),
  managerId: CuidSchema,
  teamMembers: z.array(CuidSchema).default([]),
  budget: z.number().min(0).optional(),
  progress: z.number().min(0).max(100).default(0),
});

export const UpdateProjectDTOSchema = BaseUpdateDTOSchema.extend({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: ProjectStatusSchema.optional(),
  accessLevel: ProjectAccessLevelSchema.optional(),
  startDate: ISODateSchema.optional(),
  endDate: ISODateSchema.optional(),
  managerId: CuidSchema.optional(),
  teamMembers: z.array(CuidSchema).optional(),
  budget: z.number().min(0).optional(),
  progress: z.number().min(0).max(100).optional(),
});

// Task schemas
export const TaskStatusSchema = z.enum(['Todo', 'InProgress', 'Done']);
export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const TaskEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  assigneeId: CuidSchema.optional(),
  projectId: CuidSchema.optional(),
  dueDate: DateSchema.optional(),
  completedAt: DateSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const TaskDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  assigneeId: CuidSchema.optional(),
  projectId: CuidSchema.optional(),
  dueDate: ISODateSchema.optional(),
  completedAt: ISODateSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const CreateTaskDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: TaskStatusSchema.default('Todo'),
  priority: TaskPrioritySchema.default('MEDIUM'),
  assigneeId: CuidSchema.optional(),
  projectId: CuidSchema.optional(),
  dueDate: ISODateSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateTaskDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  assigneeId: CuidSchema.optional(),
  projectId: CuidSchema.optional(),
  dueDate: ISODateSchema.optional(),
  completedAt: ISODateSchema.optional(),
  tags: z.array(z.string()).optional(),
});

// Audit Log schemas
export const RiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const AuditLogEntitySchema = BaseEntitySchema.extend({
  eventType: z.string().min(1, 'Event type is required'),
  details: z.string().min(1, 'Details are required'),
  riskLevel: RiskLevelSchema,
  userId: CuidSchema.optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
});

export const AuditLogDTOSchema = BaseDTOSchema.extend({
  eventType: z.string().min(1, 'Event type is required'),
  details: z.string().min(1, 'Details are required'),
  riskLevel: RiskLevelSchema,
  userId: CuidSchema.optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
});

export const CreateAuditLogDTOSchema = BaseCreateDTOSchema.extend({
  eventType: z.string().min(1, 'Event type is required'),
  details: z.string().min(1, 'Details are required'),
  riskLevel: RiskLevelSchema.default('LOW'),
  userId: CuidSchema.optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
});

export const UpdateAuditLogDTOSchema = BaseUpdateDTOSchema.extend({
  eventType: z.string().min(1, 'Event type is required').optional(),
  details: z.string().min(1, 'Details are required').optional(),
  riskLevel: RiskLevelSchema.optional(),
  userId: CuidSchema.optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
});

// Schema registry for easy access
export const EntitySchemas = {
  User: UserEntitySchema,
  WikiItem: WikiItemEntitySchema,
  Story: StoryEntitySchema,
  StoryIdea: StoryIdeaEntitySchema,
  Meeting: MeetingEntitySchema,
  Project: ProjectEntitySchema,
  Task: TaskEntitySchema,
  AuditLog: AuditLogEntitySchema,
} as const;

export const DTOSchemas = {
  User: UserDTOSchema,
  WikiItem: WikiItemDTOSchema,
  Story: StoryDTOSchema,
  StoryIdea: StoryIdeaDTOSchema,
  Meeting: MeetingDTOSchema,
  Project: ProjectDTOSchema,
  Task: TaskDTOSchema,
  AuditLog: AuditLogDTOSchema,
} as const;

export const CreateDTOSchemas = {
  User: CreateUserDTOSchema,
  WikiItem: CreateWikiItemDTOSchema,
  Story: CreateStoryDTOSchema,
  StoryIdea: CreateStoryIdeaDTOSchema,
  Meeting: CreateMeetingDTOSchema,
  Project: CreateProjectDTOSchema,
  Task: CreateTaskDTOSchema,
  AuditLog: CreateAuditLogDTOSchema,
} as const;

export const UpdateDTOSchemas = {
  User: UpdateUserDTOSchema,
  WikiItem: UpdateWikiItemDTOSchema,
  Story: UpdateStoryDTOSchema,
  StoryIdea: UpdateStoryIdeaDTOSchema,
  Meeting: UpdateMeetingDTOSchema,
  Project: UpdateProjectDTOSchema,
  Task: UpdateTaskDTOSchema,
  AuditLog: UpdateAuditLogDTOSchema,
} as const;
