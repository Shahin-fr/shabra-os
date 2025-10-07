/**
 * Entity type definitions for Shabra OS
 * Based on existing codebase patterns and Prisma schema
 */

import { BaseEntity, BaseDTO, BaseCreateDTO, BaseUpdateDTO, SoftDeleteEntity } from './base';
import { z } from 'zod';

// User Entity
export interface UserEntity extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
  isActive: boolean;
  avatar?: string;
  lastLogin?: Date;
}

export interface UserDTO extends BaseDTO {
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
  isActive: boolean;
  avatar?: string;
  lastLogin?: string;
}

export interface CreateUserDTO extends BaseCreateDTO {
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
  isActive?: boolean;
  avatar?: string;
}

export interface UpdateUserDTO extends BaseUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string;
  isActive?: boolean;
  avatar?: string;
}

// Wiki Item Entity
export interface WikiItemEntity extends BaseEntity {
  title: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId: string | null;
  content?: string | null;
  authorId: string;
  author?: UserEntity;
  isPublic: boolean;
  children?: WikiItemEntity[];
  // File upload fields
  fileUrl?: string;
  filePublicId?: string;
  fileType?: string;
  originalName?: string;
  fileSize?: number;
  // Markdown document fields
  slug?: string;
  originalSlug?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

export interface WikiItemDTO extends BaseDTO {
  title: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId: string | null;
  content?: string | null;
  authorId: string;
  author?: UserDTO;
  isPublic: boolean;
  children?: WikiItemDTO[];
  // File upload fields
  fileUrl?: string;
  filePublicId?: string;
  fileType?: string;
  originalName?: string;
  fileSize?: number;
  // Markdown document fields
  slug?: string;
  originalSlug?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

export interface CreateWikiItemDTO extends BaseCreateDTO {
  title: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId?: string | null;
  content?: string | null;
  authorId: string;
  isPublic?: boolean;
  // File upload fields
  fileUrl?: string;
  filePublicId?: string;
  fileType?: string;
  originalName?: string;
  fileSize?: number;
  // Markdown document fields
  slug?: string;
  originalSlug?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateWikiItemDTO extends BaseUpdateDTO {
  title?: string;
  type?: 'FOLDER' | 'DOCUMENT';
  parentId?: string | null;
  content?: string | null;
  isPublic?: boolean;
  // File upload fields
  fileUrl?: string;
  filePublicId?: string;
  fileType?: string;
  originalName?: string;
  fileSize?: number;
  // Markdown document fields
  slug?: string;
  originalSlug?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

// Story Entity
export interface StoryEntity extends BaseEntity {
  title: string;
  content: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive: boolean;
  authorId: string;
  author?: UserEntity;
  storyIdeaId?: string;
  storyIdea?: StoryIdeaEntity;
}

export interface StoryDTO extends BaseDTO {
  title: string;
  content: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive: boolean;
  authorId: string;
  author?: UserDTO;
  storyIdeaId?: string;
  storyIdea?: StoryIdeaDTO;
}

export interface CreateStoryDTO extends BaseCreateDTO {
  title: string;
  content: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive?: boolean;
  authorId: string;
  storyIdeaId?: string;
}

export interface UpdateStoryDTO extends BaseUpdateDTO {
  title?: string;
  content?: string;
  category?: string;
  storyType?: string;
  template?: string;
  guidelines?: string;
  icon?: string;
  isActive?: boolean;
  storyIdeaId?: string;
}

// Story Idea Entity
export interface StoryIdeaEntity extends BaseEntity {
  title: string;
  description: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive: boolean;
}

export interface StoryIdeaDTO extends BaseDTO {
  title: string;
  description: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive: boolean;
}

export interface CreateStoryIdeaDTO extends BaseCreateDTO {
  title: string;
  description: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateStoryIdeaDTO extends BaseUpdateDTO {
  title?: string;
  description?: string;
  category?: string;
  storyType?: string;
  template?: string;
  guidelines?: string;
  icon?: string;
  isActive?: boolean;
}

// Meeting Entity
export interface MeetingEntity extends BaseEntity {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingUrl?: string;
  organizerId: string;
  organizer?: UserEntity;
  attendees: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  actionItemsCount: number;
}

export interface MeetingDTO extends BaseDTO {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
  organizerId: string;
  organizer?: UserDTO;
  attendees: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  actionItemsCount: number;
}

export interface CreateMeetingDTO extends BaseCreateDTO {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
  organizerId: string;
  attendees: string[];
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateMeetingDTO extends BaseUpdateDTO {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingUrl?: string;
  attendees?: string[];
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
}

// Project Entity
export interface ProjectEntity extends BaseEntity {
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  startDate?: Date;
  endDate?: Date;
  managerId: string;
  manager?: UserEntity;
  teamMembers: string[];
  budget?: number;
  progress: number;
}

export interface ProjectDTO extends BaseDTO {
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  startDate?: string;
  endDate?: string;
  managerId: string;
  manager?: UserDTO;
  teamMembers: string[];
  budget?: number;
  progress: number;
}

export interface CreateProjectDTO extends BaseCreateDTO {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  accessLevel?: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  startDate?: string;
  endDate?: string;
  managerId: string;
  teamMembers?: string[];
  budget?: number;
  progress?: number;
}

export interface UpdateProjectDTO extends BaseUpdateDTO {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  accessLevel?: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  startDate?: string;
  endDate?: string;
  managerId?: string;
  teamMembers?: string[];
  budget?: number;
  progress?: number;
}

// Task Entity
export interface TaskEntity extends BaseEntity {
  title: string;
  description?: string;
  status: 'Todo' | 'InProgress' | 'Done';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: string;
  assignee?: UserEntity;
  projectId?: string;
  project?: ProjectEntity;
  dueDate?: Date;
  completedAt?: Date;
  tags?: string[];
}

export interface TaskDTO extends BaseDTO {
  title: string;
  description?: string;
  status: 'Todo' | 'InProgress' | 'Done';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: string;
  assignee?: UserDTO;
  projectId?: string;
  project?: ProjectDTO;
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
}

export interface CreateTaskDTO extends BaseCreateDTO {
  title: string;
  description?: string;
  status?: 'Todo' | 'InProgress' | 'Done';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: string;
  projectId?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskDTO extends BaseUpdateDTO {
  title?: string;
  description?: string;
  status?: 'Todo' | 'InProgress' | 'Done';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: string;
  projectId?: string;
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
}

// Audit Log Entity
export interface AuditLogEntity extends BaseEntity {
  eventType: string;
  details: string; // JSON string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  user?: UserEntity;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditLogDTO extends BaseDTO {
  eventType: string;
  details: string; // JSON string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  user?: UserDTO;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface CreateAuditLogDTO extends BaseCreateDTO {
  eventType: string;
  details: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface UpdateAuditLogDTO extends BaseUpdateDTO {
  eventType?: string;
  details?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

// Entity type unions
export type Entity = 
  | UserEntity
  | WikiItemEntity
  | StoryEntity
  | StoryIdeaEntity
  | MeetingEntity
  | ProjectEntity
  | TaskEntity
  | AuditLogEntity;

export type DTO = 
  | UserDTO
  | WikiItemDTO
  | StoryDTO
  | StoryIdeaDTO
  | MeetingDTO
  | ProjectDTO
  | TaskDTO
  | AuditLogDTO;

export type CreateDTO = 
  | CreateUserDTO
  | CreateWikiItemDTO
  | CreateStoryDTO
  | CreateStoryIdeaDTO
  | CreateMeetingDTO
  | CreateProjectDTO
  | CreateTaskDTO
  | CreateAuditLogDTO;

export type UpdateDTO = 
  | UpdateUserDTO
  | UpdateWikiItemDTO
  | UpdateStoryDTO
  | UpdateStoryIdeaDTO
  | UpdateMeetingDTO
  | UpdateProjectDTO
  | UpdateTaskDTO
  | UpdateAuditLogDTO;

// Entity name type
export type EntityName = 
  | 'User'
  | 'WikiItem'
  | 'Story'
  | 'StoryIdea'
  | 'Meeting'
  | 'Project'
  | 'Task'
  | 'AuditLog';

// Entity type mapping
export type EntityTypeMap = {
  User: UserEntity;
  WikiItem: WikiItemEntity;
  Story: StoryEntity;
  StoryIdea: StoryIdeaEntity;
  Meeting: MeetingEntity;
  Project: ProjectEntity;
  Task: TaskEntity;
  AuditLog: AuditLogEntity;
};

export type DTOTypeMap = {
  User: UserDTO;
  WikiItem: WikiItemDTO;
  Story: StoryDTO;
  StoryIdea: StoryIdeaDTO;
  Meeting: MeetingDTO;
  Project: ProjectDTO;
  Task: TaskDTO;
  AuditLog: AuditLogDTO;
};

export type CreateDTOTypeMap = {
  User: CreateUserDTO;
  WikiItem: CreateWikiItemDTO;
  Story: CreateStoryDTO;
  StoryIdea: CreateStoryIdeaDTO;
  Meeting: CreateMeetingDTO;
  Project: CreateProjectDTO;
  Task: CreateTaskDTO;
  AuditLog: CreateAuditLogDTO;
};

export type UpdateDTOTypeMap = {
  User: UpdateUserDTO;
  WikiItem: UpdateWikiItemDTO;
  Story: UpdateStoryDTO;
  StoryIdea: UpdateStoryIdeaDTO;
  Meeting: UpdateMeetingDTO;
  Project: UpdateProjectDTO;
  Task: UpdateTaskDTO;
  AuditLog: UpdateAuditLogDTO;
};
