/**
 * Zod validation schemas for Shabra OS entities
 * Provides type-safe validation for all entities and DTOs based on Prisma schema
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

// Enum schemas based on Prisma schema
export const RoleSchema = z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']);
export const ProjectStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']);
export const ProjectAccessLevelSchema = z.enum(['PUBLIC', 'PRIVATE', 'RESTRICTED']);
export const TaskStatusSchema = z.enum(['Todo', 'InProgress', 'Done']);
export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const LeaveTypeSchema = z.enum(['ANNUAL', 'SICK', 'UNPAID', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'STUDY', 'OTHER']);
export const LeaveStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);
export const RequestTypeSchema = z.enum(['LEAVE', 'OVERTIME', 'EXPENSE_CLAIM', 'GENERAL']);
export const RequestStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);
export const DocumentCategorySchema = z.enum(['CONTRACT', 'IDENTIFICATION', 'CERTIFICATE', 'PERFORMANCE_REVIEW', 'MEDICAL', 'PAYROLL', 'OTHER']);
export const ChecklistTypeSchema = z.enum(['ONBOARDING', 'OFFBOARDING']);
export const ChecklistStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const DefaultAssigneeRoleSchema = z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN']);
export const AnnouncementCategorySchema = z.enum(['GENERAL', 'TECHNICAL', 'EVENT', 'IMPORTANT']);
export const MeetingTypeSchema = z.enum(['ONE_ON_ONE', 'TEAM_MEETING']);
export const MeetingStatusSchema = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']);
export const RiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

// User schemas - matches Prisma User model
export const UserEntitySchema = BaseEntitySchema.extend({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  roles: RoleSchema,
  isActive: z.boolean(),
  avatar: z.string().url().optional(),
  managerId: CuidSchema.optional(),
});

export const UserDTOSchema = BaseDTOSchema.extend({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema,
  roles: RoleSchema,
  isActive: z.boolean(),
  avatar: z.string().url().optional(),
  managerId: CuidSchema.optional(),
});

export const CreateUserDTOSchema = BaseCreateDTOSchema.extend({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  roles: RoleSchema,
  isActive: z.boolean().default(true),
  avatar: z.string().url().optional(),
  managerId: CuidSchema.optional(),
});

export const UpdateUserDTOSchema = BaseUpdateDTOSchema.extend({
  firstName: NameSchema.optional(),
  lastName: NameSchema.optional(),
  email: EmailSchema.optional(),
  password: PasswordSchema.optional(),
  roles: RoleSchema.optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().url().optional(),
  managerId: CuidSchema.optional(),
});

// Profile schemas - matches Prisma Profile model
export const ProfileEntitySchema = BaseEntitySchema.extend({
  userId: CuidSchema,
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  startDate: DateSchema.optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export const ProfileDTOSchema = BaseDTOSchema.extend({
  userId: CuidSchema,
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  startDate: ISODateSchema.optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export const CreateProfileDTOSchema = BaseCreateDTOSchema.extend({
  userId: CuidSchema,
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  startDate: ISODateSchema.optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export const UpdateProfileDTOSchema = BaseUpdateDTOSchema.extend({
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  startDate: ISODateSchema.optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

// Project schemas - matches Prisma Project model
export const ProjectEntitySchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().optional(),
  status: ProjectStatusSchema,
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
  accessLevel: ProjectAccessLevelSchema,
});

export const ProjectDTOSchema = BaseDTOSchema.extend({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().optional(),
  status: ProjectStatusSchema,
  startDate: ISODateSchema.optional(),
  endDate: ISODateSchema.optional(),
  accessLevel: ProjectAccessLevelSchema,
});

export const CreateProjectDTOSchema = BaseCreateDTOSchema.extend({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().optional(),
  status: ProjectStatusSchema.default('ACTIVE'),
  startDate: ISODateSchema.optional(),
  endDate: ISODateSchema.optional(),
  accessLevel: ProjectAccessLevelSchema.default('PRIVATE'),
});

export const UpdateProjectDTOSchema = BaseUpdateDTOSchema.extend({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters').optional(),
  description: z.string().optional(),
  status: ProjectStatusSchema.optional(),
  startDate: ISODateSchema.optional(),
  endDate: ISODateSchema.optional(),
  accessLevel: ProjectAccessLevelSchema.optional(),
});

// Task schemas - matches Prisma Task model
export const TaskEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  dueDate: DateSchema.optional(),
  createdBy: CuidSchema,
  assignedTo: CuidSchema.optional(),
  projectId: CuidSchema.optional(),
});

export const TaskDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  dueDate: ISODateSchema.optional(),
  createdBy: CuidSchema,
  assignedTo: CuidSchema.optional(),
  projectId: CuidSchema.optional(),
});

export const CreateTaskDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  status: TaskStatusSchema.default('Todo'),
  priority: TaskPrioritySchema.default('MEDIUM'),
  dueDate: ISODateSchema.optional(),
  createdBy: CuidSchema,
  assignedTo: CuidSchema.optional(),
  projectId: CuidSchema.optional(),
});

export const UpdateTaskDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().optional(),
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  dueDate: ISODateSchema.optional(),
  assignedTo: CuidSchema.optional(),
  projectId: CuidSchema.optional(),
});

// Document schemas - matches Prisma Document model
export const DocumentEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().optional(),
  authorId: CuidSchema,
  isPublic: z.boolean(),
  type: z.string().default('DOCUMENT'),
  parentId: CuidSchema.optional(),
  order: z.number().int().default(0),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().optional(),
  fileType: z.string().optional(),
  originalName: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
});

export const DocumentDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().optional(),
  authorId: CuidSchema,
  isPublic: z.boolean(),
  type: z.string(),
  parentId: CuidSchema.optional(),
  order: z.number().int(),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().optional(),
  fileType: z.string().optional(),
  originalName: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
});

export const CreateDocumentDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().optional(),
  authorId: CuidSchema,
  isPublic: z.boolean().default(false),
  type: z.string().default('DOCUMENT'),
  parentId: CuidSchema.optional(),
  order: z.number().int().default(0),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().optional(),
  fileType: z.string().optional(),
  originalName: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
});

export const UpdateDocumentDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().optional(),
  isPublic: z.boolean().optional(),
  type: z.string().optional(),
  parentId: CuidSchema.optional(),
  order: z.number().int().optional(),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().optional(),
  fileType: z.string().optional(),
  originalName: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
});

// Story schemas - matches Prisma Story model
export const StoryEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  notes: z.string().optional(),
  visualNotes: z.string().optional(),
  link: z.string().url().optional(),
  day: z.string().min(1, 'Day is required'),
  order: z.number().int().default(0),
  status: z.string().default('DRAFT'),
  projectId: CuidSchema.optional(),
  storyTypeId: CuidSchema.optional(),
  storyIdeaId: CuidSchema.optional(),
  customTitle: z.string().optional(),
  type: z.string().optional(),
  ideaId: CuidSchema.optional(),
  authorId: CuidSchema,
});

export const StoryDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  notes: z.string().optional(),
  visualNotes: z.string().optional(),
  link: z.string().url().optional(),
  day: z.string().min(1, 'Day is required'),
  order: z.number().int(),
  status: z.string(),
  projectId: CuidSchema.optional(),
  storyTypeId: CuidSchema.optional(),
  storyIdeaId: CuidSchema.optional(),
  customTitle: z.string().optional(),
  type: z.string().optional(),
  ideaId: CuidSchema.optional(),
  authorId: CuidSchema,
});

export const CreateStoryDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  notes: z.string().optional(),
  visualNotes: z.string().optional(),
  link: z.string().url().optional(),
  day: z.string().min(1, 'Day is required'),
  order: z.number().int().default(0),
  status: z.string().default('DRAFT'),
  projectId: CuidSchema.optional(),
  storyTypeId: CuidSchema.optional(),
  storyIdeaId: CuidSchema.optional(),
  customTitle: z.string().optional(),
  type: z.string().optional(),
  ideaId: CuidSchema.optional(),
  authorId: CuidSchema,
});

export const UpdateStoryDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  notes: z.string().optional(),
  visualNotes: z.string().optional(),
  link: z.string().url().optional(),
  day: z.string().min(1, 'Day is required').optional(),
  order: z.number().int().optional(),
  status: z.string().optional(),
  projectId: CuidSchema.optional(),
  storyTypeId: CuidSchema.optional(),
  storyIdeaId: CuidSchema.optional(),
  customTitle: z.string().optional(),
  type: z.string().optional(),
  ideaId: CuidSchema.optional(),
});

// StoryType schemas - matches Prisma StoryType model
export const StoryTypeEntitySchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  icon: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const StoryTypeDTOSchema = BaseDTOSchema.extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  icon: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export const CreateStoryTypeDTOSchema = BaseCreateDTOSchema.extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  icon: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateStoryTypeDTOSchema = BaseUpdateDTOSchema.extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// StoryIdea schemas - matches Prisma StoryIdea model
export const StoryIdeaEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  storyType: z.string().min(1, 'Story type is required'),
  template: z.string().min(1, 'Template is required'),
  guidelines: z.string().min(1, 'Guidelines are required'),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
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

// Meeting schemas - matches Prisma Meeting model
export const MeetingEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  creatorId: CuidSchema,
  startTime: DateSchema,
  endTime: DateSchema,
  type: MeetingTypeSchema,
  status: MeetingStatusSchema,
  notes: z.string().optional(),
});

export const MeetingDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  creatorId: CuidSchema,
  startTime: ISODateSchema,
  endTime: ISODateSchema,
  type: MeetingTypeSchema,
  status: MeetingStatusSchema,
  notes: z.string().optional(),
});

export const CreateMeetingDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  creatorId: CuidSchema,
  startTime: ISODateSchema,
  endTime: ISODateSchema,
  type: MeetingTypeSchema.default('ONE_ON_ONE'),
  status: MeetingStatusSchema.default('SCHEDULED'),
  notes: z.string().optional(),
});

export const UpdateMeetingDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  startTime: ISODateSchema.optional(),
  endTime: ISODateSchema.optional(),
  type: MeetingTypeSchema.optional(),
  status: MeetingStatusSchema.optional(),
  notes: z.string().optional(),
});

// MeetingAttendee schemas - matches Prisma MeetingAttendee model
export const MeetingAttendeeEntitySchema = BaseEntitySchema.extend({
  meetingId: CuidSchema,
  userId: CuidSchema,
});

export const MeetingAttendeeDTOSchema = BaseDTOSchema.extend({
  meetingId: CuidSchema,
  userId: CuidSchema,
});

export const CreateMeetingAttendeeDTOSchema = BaseCreateDTOSchema.extend({
  meetingId: CuidSchema,
  userId: CuidSchema,
});

export const UpdateMeetingAttendeeDTOSchema = BaseUpdateDTOSchema.extend({
  meetingId: CuidSchema.optional(),
  userId: CuidSchema.optional(),
});

// TalkingPoint schemas - matches Prisma TalkingPoint model
export const TalkingPointEntitySchema = BaseEntitySchema.extend({
  meetingId: CuidSchema,
  content: z.string().min(1, 'Content is required'),
  addedById: CuidSchema,
  isCompleted: z.boolean().default(false),
});

export const TalkingPointDTOSchema = BaseDTOSchema.extend({
  meetingId: CuidSchema,
  content: z.string().min(1, 'Content is required'),
  addedById: CuidSchema,
  isCompleted: z.boolean(),
});

export const CreateTalkingPointDTOSchema = BaseCreateDTOSchema.extend({
  meetingId: CuidSchema,
  content: z.string().min(1, 'Content is required'),
  addedById: CuidSchema,
  isCompleted: z.boolean().default(false),
});

export const UpdateTalkingPointDTOSchema = BaseUpdateDTOSchema.extend({
  content: z.string().min(1, 'Content is required').optional(),
  isCompleted: z.boolean().optional(),
});

// ActionItem schemas - matches Prisma ActionItem model
export const ActionItemEntitySchema = BaseEntitySchema.extend({
  meetingId: CuidSchema,
  content: z.string().min(1, 'Content is required'),
  assigneeId: CuidSchema,
  isCompleted: z.boolean().default(false),
  relatedTaskId: CuidSchema.optional(),
});

export const ActionItemDTOSchema = BaseDTOSchema.extend({
  meetingId: CuidSchema,
  content: z.string().min(1, 'Content is required'),
  assigneeId: CuidSchema,
  isCompleted: z.boolean(),
  relatedTaskId: CuidSchema.optional(),
});

export const CreateActionItemDTOSchema = BaseCreateDTOSchema.extend({
  meetingId: CuidSchema,
  content: z.string().min(1, 'Content is required'),
  assigneeId: CuidSchema,
  isCompleted: z.boolean().default(false),
  relatedTaskId: CuidSchema.optional(),
});

export const UpdateActionItemDTOSchema = BaseUpdateDTOSchema.extend({
  content: z.string().min(1, 'Content is required').optional(),
  assigneeId: CuidSchema.optional(),
  isCompleted: z.boolean().optional(),
  relatedTaskId: CuidSchema.optional(),
});

// AuditLog schemas - matches Prisma AuditLog model
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

// Announcement schemas - matches Prisma Announcement model
export const AnnouncementEntitySchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  category: AnnouncementCategorySchema,
  isPinned: z.boolean(),
  authorId: CuidSchema,
});

export const AnnouncementDTOSchema = BaseDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  category: AnnouncementCategorySchema,
  isPinned: z.boolean(),
  authorId: CuidSchema,
});

export const CreateAnnouncementDTOSchema = BaseCreateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  category: AnnouncementCategorySchema.optional(),
  isPinned: z.boolean().optional(),
  authorId: CuidSchema,
});

export const UpdateAnnouncementDTOSchema = BaseUpdateDTOSchema.extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  category: AnnouncementCategorySchema.optional(),
  isPinned: z.boolean().optional(),
  authorId: CuidSchema.optional(),
});

// Request schemas - matches Prisma Request model
export const RequestEntitySchema = BaseEntitySchema.extend({
  userId: CuidSchema,
  type: RequestTypeSchema,
  details: z.record(z.any()).optional(),
  reason: z.string().min(1, 'Reason is required'),
  status: RequestStatusSchema,
  rejectionReason: z.string().optional(),
  reviewedBy: CuidSchema.optional(),
  reviewedAt: DateSchema.optional(),
});

export const RequestDTOSchema = BaseDTOSchema.extend({
  userId: CuidSchema,
  type: RequestTypeSchema,
  details: z.record(z.any()).optional(),
  reason: z.string().min(1, 'Reason is required'),
  status: RequestStatusSchema,
  rejectionReason: z.string().optional(),
  reviewedBy: CuidSchema.optional(),
  reviewedAt: DateSchema.optional(),
});

export const CreateRequestDTOSchema = BaseCreateDTOSchema.extend({
  userId: CuidSchema,
  type: RequestTypeSchema,
  details: z.record(z.any()).optional(),
  reason: z.string().min(1, 'Reason is required'),
  status: RequestStatusSchema.optional(),
  rejectionReason: z.string().optional(),
  reviewedBy: CuidSchema.optional(),
  reviewedAt: DateSchema.optional(),
});

export const UpdateRequestDTOSchema = BaseUpdateDTOSchema.extend({
  userId: CuidSchema.optional(),
  type: RequestTypeSchema.optional(),
  details: z.record(z.any()).optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
  status: RequestStatusSchema.optional(),
  rejectionReason: z.string().optional(),
  reviewedBy: CuidSchema.optional(),
  reviewedAt: DateSchema.optional(),
});

// Schema registry for easy access - comprehensive list based on Prisma schema
export const EntitySchemas = {
  User: UserEntitySchema,
  Profile: ProfileEntitySchema,
  Project: ProjectEntitySchema,
  Task: TaskEntitySchema,
  Document: DocumentEntitySchema,
  Story: StoryEntitySchema,
  StoryType: StoryTypeEntitySchema,
  StoryIdea: StoryIdeaEntitySchema,
  Meeting: MeetingEntitySchema,
  MeetingAttendee: MeetingAttendeeEntitySchema,
  TalkingPoint: TalkingPointEntitySchema,
  ActionItem: ActionItemEntitySchema,
  AuditLog: AuditLogEntitySchema,
  Announcement: AnnouncementEntitySchema,
  Request: RequestEntitySchema,
} as const;

export const DTOSchemas = {
  User: UserDTOSchema,
  Profile: ProfileDTOSchema,
  Project: ProjectDTOSchema,
  Task: TaskDTOSchema,
  Document: DocumentDTOSchema,
  Story: StoryDTOSchema,
  StoryType: StoryTypeDTOSchema,
  StoryIdea: StoryIdeaDTOSchema,
  Meeting: MeetingDTOSchema,
  MeetingAttendee: MeetingAttendeeDTOSchema,
  TalkingPoint: TalkingPointDTOSchema,
  ActionItem: ActionItemDTOSchema,
  AuditLog: AuditLogDTOSchema,
  Announcement: AnnouncementDTOSchema,
  Request: RequestDTOSchema,
} as const;

export const CreateDTOSchemas = {
  User: CreateUserDTOSchema,
  Profile: CreateProfileDTOSchema,
  Project: CreateProjectDTOSchema,
  Task: CreateTaskDTOSchema,
  Document: CreateDocumentDTOSchema,
  Story: CreateStoryDTOSchema,
  StoryType: CreateStoryTypeDTOSchema,
  StoryIdea: CreateStoryIdeaDTOSchema,
  Meeting: CreateMeetingDTOSchema,
  MeetingAttendee: CreateMeetingAttendeeDTOSchema,
  TalkingPoint: CreateTalkingPointDTOSchema,
  ActionItem: CreateActionItemDTOSchema,
  AuditLog: CreateAuditLogDTOSchema,
  Announcement: CreateAnnouncementDTOSchema,
  Request: CreateRequestDTOSchema,
} as const;

export const UpdateDTOSchemas = {
  User: UpdateUserDTOSchema,
  Profile: UpdateProfileDTOSchema,
  Project: UpdateProjectDTOSchema,
  Task: UpdateTaskDTOSchema,
  Document: UpdateDocumentDTOSchema,
  Story: UpdateStoryDTOSchema,
  StoryType: UpdateStoryTypeDTOSchema,
  StoryIdea: UpdateStoryIdeaDTOSchema,
  Meeting: UpdateMeetingDTOSchema,
  MeetingAttendee: UpdateMeetingAttendeeDTOSchema,
  TalkingPoint: UpdateTalkingPointDTOSchema,
  ActionItem: UpdateActionItemDTOSchema,
  AuditLog: UpdateAuditLogDTOSchema,
  Announcement: UpdateAnnouncementDTOSchema,
  Request: UpdateRequestDTOSchema,
} as const;
