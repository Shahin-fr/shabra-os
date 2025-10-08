/**
 * Entity type definitions for Shabra OS
 * Based on Prisma schema - these are the source of truth for database entities
 */

import { BaseEntity, BaseDTO, BaseCreateDTO, BaseUpdateDTO } from './base';

// User Entity - matches Prisma User model
export interface UserEntity extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string;
  isActive: boolean;
  avatar?: string;
  managerId?: string;
  manager?: UserEntity;
  subordinates?: UserEntity[];
  profile?: ProfileEntity;
  createdTasks?: TaskEntity[];
  assignedTasks?: TaskEntity[];
  stories?: StoryEntity[];
  leaveRequests?: LeaveRequestEntity[];
  reviewedLeaveRequests?: LeaveRequestEntity[];
  requests?: RequestEntity[];
  reviewedRequests?: RequestEntity[];
  documents?: EmployeeDocumentEntity[];
  uploadedDocuments?: EmployeeDocumentEntity[];
  wikiDocuments?: DocumentEntity[];
  employeeChecklists?: EmployeeChecklistEntity[];
  createdChecklistTemplates?: ChecklistTemplateEntity[];
  attendances?: AttendanceEntity[];
  workSchedule?: WorkScheduleEntity;
  announcements?: AnnouncementEntity[];
  createdMeetings?: MeetingEntity[];
  meetingAttendances?: MeetingAttendeeEntity[];
  addedTalkingPoints?: TalkingPointEntity[];
  assignedActionItems?: ActionItemEntity[];
}

// Profile Entity - matches Prisma Profile model
export interface ProfileEntity extends BaseEntity {
  userId: string;
  user: UserEntity;
  jobTitle?: string;
  department?: string;
  startDate?: Date;
  phoneNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// Announcement Entity - matches Prisma Announcement model
export interface AnnouncementEntity extends BaseEntity {
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT';
  isPinned: boolean;
  authorId: string;
  author: UserEntity;
}

export interface AnnouncementDTO extends BaseDTO {
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT';
  isPinned: boolean;
  authorId: string;
}

export interface CreateAnnouncementDTO extends BaseCreateDTO {
  title: string;
  content: string;
  category?: 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT';
  isPinned?: boolean;
  authorId: string;
}

export interface UpdateAnnouncementDTO extends BaseUpdateDTO {
  title?: string;
  content?: string;
  category?: 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT';
  isPinned?: boolean;
  authorId?: string;
}

// Project Entity - matches Prisma Project model
export interface ProjectEntity extends BaseEntity {
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  startDate?: Date;
  endDate?: Date;
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  stories?: StoryEntity[];
  tasks?: TaskEntity[];
  contentSlots?: ContentSlotEntity[];
}

// Task Entity - matches Prisma Task model
export interface TaskEntity extends BaseEntity {
  title: string;
  description?: string;
  status: 'Todo' | 'InProgress' | 'Done';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
  createdBy: string;
  assignedTo?: string;
  projectId?: string;
  creator: UserEntity;
  assignee?: UserEntity;
  project?: ProjectEntity;
}

// Document Entity - matches Prisma Document model
export interface DocumentEntity extends BaseEntity {
  title: string;
  content?: string;
  authorId: string;
  isPublic: boolean;
  type: string;
  parentId?: string;
  order: number;
  fileUrl?: string;
  filePublicId?: string;
  fileType?: string;
  originalName?: string;
  fileSize?: number;
  author: UserEntity;
  parent?: DocumentEntity;
  children?: DocumentEntity[];
}

// Story Entity - matches Prisma Story model
export interface StoryEntity extends BaseEntity {
  title: string;
  content: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: string;
  order: number;
  status: string;
  projectId?: string;
  storyTypeId?: string;
  storyIdeaId?: string;
  customTitle?: string;
  type?: string;
  ideaId?: string;
  authorId: string;
  project?: ProjectEntity;
  storyType?: StoryTypeEntity;
  storyIdea?: StoryIdeaEntity;
  author: UserEntity;
}

// StoryType Entity - matches Prisma StoryType model
export interface StoryTypeEntity extends BaseEntity {
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  stories?: StoryEntity[];
}

// StoryIdea Entity - matches Prisma StoryIdea model
export interface StoryIdeaEntity extends BaseEntity {
  title: string;
  description: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive: boolean;
  stories?: StoryEntity[];
}

// Meeting Entity - matches Prisma Meeting model
export interface MeetingEntity extends BaseEntity {
  title: string;
  creatorId: string;
  startTime: Date;
  endTime: Date;
  type: 'ONE_ON_ONE' | 'TEAM_MEETING';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  creator: UserEntity;
  attendees?: MeetingAttendeeEntity[];
  talkingPoints?: TalkingPointEntity[];
  actionItems?: ActionItemEntity[];
}

// MeetingAttendee Entity - matches Prisma MeetingAttendee model
export interface MeetingAttendeeEntity extends BaseEntity {
  meetingId: string;
  userId: string;
  meeting: MeetingEntity;
  user: UserEntity;
}

// TalkingPoint Entity - matches Prisma TalkingPoint model
export interface TalkingPointEntity extends BaseEntity {
  meetingId: string;
  content: string;
  addedById: string;
  isCompleted: boolean;
  meeting: MeetingEntity;
  addedBy: UserEntity;
}

// ActionItem Entity - matches Prisma ActionItem model
export interface ActionItemEntity extends BaseEntity {
  meetingId: string;
  content: string;
  assigneeId: string;
  isCompleted: boolean;
  relatedTaskId?: string;
  meeting: MeetingEntity;
  assignee: UserEntity;
}

// LeaveRequest Entity - matches Prisma LeaveRequest model
export interface LeaveRequestEntity extends BaseEntity {
  userId: string;
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'OTHER';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  user: UserEntity;
  reviewer?: UserEntity;
}

// Request Entity - matches Prisma Request model
export interface RequestEntity extends BaseEntity {
  userId: string;
  type: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details?: any; // JSON
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  user: UserEntity;
  reviewer?: UserEntity;
}

export interface RequestDTO extends BaseDTO {
  userId: string;
  type: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details?: any; // JSON
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface CreateRequestDTO extends BaseCreateDTO {
  userId: string;
  type: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details?: any; // JSON
  reason: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface UpdateRequestDTO extends BaseUpdateDTO {
  userId?: string;
  type?: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details?: any; // JSON
  reason?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// EmployeeDocument Entity - matches Prisma EmployeeDocument model
export interface EmployeeDocumentEntity extends BaseEntity {
  userId: string;
  name: string;
  url: string;
  publicId: string;
  fileType: string;
  category: 'CONTRACT' | 'IDENTIFICATION' | 'CERTIFICATE' | 'PERFORMANCE_REVIEW' | 'MEDICAL' | 'PAYROLL' | 'OTHER';
  uploadedById: string;
  user: UserEntity;
  uploadedBy: UserEntity;
}

// ChecklistTemplate Entity - matches Prisma ChecklistTemplate model
export interface ChecklistTemplateEntity extends BaseEntity {
  name: string;
  type: 'ONBOARDING' | 'OFFBOARDING';
  description?: string;
  isActive: boolean;
  createdById: string;
  createdBy: UserEntity;
  tasks?: ChecklistTemplateTaskEntity[];
  employeeChecklists?: EmployeeChecklistEntity[];
}

// ChecklistTemplateTask Entity - matches Prisma ChecklistTemplateTask model
export interface ChecklistTemplateTaskEntity extends BaseEntity {
  templateId: string;
  title: string;
  description?: string;
  defaultAssigneeRole: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  order: number;
  isRequired: boolean;
  estimatedDays?: number;
  template: ChecklistTemplateEntity;
}

// EmployeeChecklist Entity - matches Prisma EmployeeChecklist model
export interface EmployeeChecklistEntity extends BaseEntity {
  employeeId: string;
  templateId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: Date;
  completedAt?: Date;
  notes?: string;
  employee: UserEntity;
  template: ChecklistTemplateEntity;
}

// Attendance Entity - matches Prisma Attendance model
export interface AttendanceEntity extends BaseEntity {
  userId: string;
  checkIn: Date;
  checkOut?: Date;
  user: UserEntity;
}

// ContentSlot Entity - matches Prisma ContentSlot model
export interface ContentSlotEntity extends BaseEntity {
  title: string;
  description?: string;
  type: string;
  startDate: Date;
  endDate: Date;
  projectId?: string;
  project?: ProjectEntity;
}

// WorkSchedule Entity - matches Prisma WorkSchedule model
export interface WorkScheduleEntity extends BaseEntity {
  userId: string;
  saturday: boolean;
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  user: UserEntity;
}

// Holiday Entity - matches Prisma Holiday model
export interface HolidayEntity extends BaseEntity {
  name: string;
  date: Date;
}

// AuditLog Entity - matches Prisma AuditLog model
export interface AuditLogEntity extends BaseEntity {
  eventType: string;
  details: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

// TrackedInstagramPage Entity - matches Prisma TrackedInstagramPage model
export interface TrackedInstagramPageEntity extends BaseEntity {
  username: string;
  profileUrl: string;
  followerCount: number;
  status: string;
  reels?: InstagramReelEntity[];
}

// InstagramReel Entity - matches Prisma InstagramReel model
export interface InstagramReelEntity extends BaseEntity {
  postUrl: string;
  shortCode: string;
  thumbnailUrl?: string;
  viewCount: number;
  publishedAt: Date;
  pageId: number;
  trackedPage: TrackedInstagramPageEntity;
}

// DTOs - Data Transfer Objects for API responses
export interface UserDTO extends BaseDTO {
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
  isActive: boolean;
  avatar?: string;
  managerId?: string;
  manager?: UserDTO;
  subordinates?: UserDTO[];
  profile?: ProfileDTO;
}

// Profile DTOs
export interface ProfileDTO extends BaseDTO {
  userId: string;
  user?: UserDTO;
  jobTitle?: string;
  department?: string;
  startDate?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface CreateProfileDTO extends BaseCreateDTO {
  userId: string;
  jobTitle?: string;
  department?: string;
  startDate?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface UpdateProfileDTO extends BaseUpdateDTO {
  jobTitle?: string;
  department?: string;
  startDate?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// User DTOs
export interface CreateUserDTO extends BaseCreateDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string;
  isActive?: boolean;
  avatar?: string;
  managerId?: string;
}

export interface UpdateUserDTO extends BaseUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  roles?: string;
  isActive?: boolean;
  avatar?: string;
  managerId?: string;
}

// Project DTOs
export interface ProjectDTO extends BaseDTO {
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  stories?: StoryDTO[];
  tasks?: TaskDTO[];
  contentSlots?: ContentSlotDTO[];
}

export interface CreateProjectDTO extends BaseCreateDTO {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  accessLevel?: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
}

export interface UpdateProjectDTO extends BaseUpdateDTO {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  accessLevel?: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
}

// Task DTOs
export interface TaskDTO extends BaseDTO {
  title: string;
  description?: string;
  status: 'Todo' | 'InProgress' | 'Done';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  createdBy: string;
  assignedTo?: string;
  projectId?: string;
  creator?: UserDTO;
  assignee?: UserDTO;
  project?: ProjectDTO;
}

export interface CreateTaskDTO extends BaseCreateDTO {
  title: string;
  description?: string;
  status?: 'Todo' | 'InProgress' | 'Done';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  createdBy: string;
  assignedTo?: string;
  projectId?: string;
}

export interface UpdateTaskDTO extends BaseUpdateDTO {
  title?: string;
  description?: string;
  status?: 'Todo' | 'InProgress' | 'Done';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignedTo?: string;
  projectId?: string;
}

// Document DTOs
export interface DocumentDTO extends BaseDTO {
  title: string;
  content?: string;
  authorId: string;
  isPublic: boolean;
  type: string;
  parentId?: string;
  order: number;
  fileUrl?: string;
  filePublicId?: string;
  fileType?: string;
  originalName?: string;
  fileSize?: number;
  author?: UserDTO;
  parent?: DocumentDTO;
  children?: DocumentDTO[];
}

export interface CreateDocumentDTO extends BaseCreateDTO {
  title: string;
  content?: string;
  authorId: string;
  isPublic?: boolean;
  type?: string;
  parentId?: string;
  order?: number;
  fileUrl?: string;
  filePublicId?: string;
  fileType?: string;
  originalName?: string;
  fileSize?: number;
}

export interface UpdateDocumentDTO extends BaseUpdateDTO {
  title?: string;
  content?: string;
  isPublic?: boolean;
  type?: string;
  parentId?: string;
  order?: number;
  fileUrl?: string;
  filePublicId?: string;
  fileType?: string;
  originalName?: string;
  fileSize?: number;
}

// Story DTOs
export interface StoryDTO extends BaseDTO {
  title: string;
  content: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: string;
  order: number;
  status: string;
  projectId?: string;
  storyTypeId?: string;
  storyIdeaId?: string;
  customTitle?: string;
  type?: string;
  ideaId?: string;
  authorId: string;
  project?: ProjectDTO;
  storyType?: StoryTypeDTO;
  storyIdea?: StoryIdeaDTO;
  author?: UserDTO;
}

export interface CreateStoryDTO extends BaseCreateDTO {
  title: string;
  content: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: string;
  order?: number;
  status?: string;
  projectId?: string;
  storyTypeId?: string;
  storyIdeaId?: string;
  customTitle?: string;
  type?: string;
  ideaId?: string;
  authorId: string;
}

export interface UpdateStoryDTO extends BaseUpdateDTO {
  title?: string;
  content?: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day?: string;
  order?: number;
  status?: string;
  projectId?: string;
  storyTypeId?: string;
  storyIdeaId?: string;
  customTitle?: string;
  type?: string;
  ideaId?: string;
}

// StoryType DTOs
export interface StoryTypeDTO extends BaseDTO {
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  stories?: StoryDTO[];
}

export interface CreateStoryTypeDTO extends BaseCreateDTO {
  name: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateStoryTypeDTO extends BaseUpdateDTO {
  name?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
}

// StoryIdea DTOs
export interface StoryIdeaDTO extends BaseDTO {
  title: string;
  description: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive: boolean;
  stories?: StoryDTO[];
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

// Meeting DTOs
export interface MeetingDTO extends BaseDTO {
  title: string;
  creatorId: string;
  startTime: string;
  endTime: string;
  type: 'ONE_ON_ONE' | 'TEAM_MEETING';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  creator?: UserDTO;
  attendees?: MeetingAttendeeDTO[];
  talkingPoints?: TalkingPointDTO[];
  actionItems?: ActionItemDTO[];
}

export interface CreateMeetingDTO extends BaseCreateDTO {
  title: string;
  creatorId: string;
  startTime: string;
  endTime: string;
  type?: 'ONE_ON_ONE' | 'TEAM_MEETING';
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface UpdateMeetingDTO extends BaseUpdateDTO {
  title?: string;
  startTime?: string;
  endTime?: string;
  type?: 'ONE_ON_ONE' | 'TEAM_MEETING';
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

// MeetingAttendee DTOs
export interface MeetingAttendeeDTO extends BaseDTO {
  meetingId: string;
  userId: string;
  meeting?: MeetingDTO;
  user?: UserDTO;
}

export interface CreateMeetingAttendeeDTO extends BaseCreateDTO {
  meetingId: string;
  userId: string;
}

export interface UpdateMeetingAttendeeDTO extends BaseUpdateDTO {
  meetingId?: string;
  userId?: string;
}

// TalkingPoint DTOs
export interface TalkingPointDTO extends BaseDTO {
  meetingId: string;
  content: string;
  addedById: string;
  isCompleted: boolean;
  meeting?: MeetingDTO;
  addedBy?: UserDTO;
}

export interface CreateTalkingPointDTO extends BaseCreateDTO {
  meetingId: string;
  content: string;
  addedById: string;
  isCompleted?: boolean;
}

export interface UpdateTalkingPointDTO extends BaseUpdateDTO {
  content?: string;
  isCompleted?: boolean;
}

// ActionItem DTOs
export interface ActionItemDTO extends BaseDTO {
  meetingId: string;
  content: string;
  assigneeId: string;
  isCompleted: boolean;
  relatedTaskId?: string;
  meeting?: MeetingDTO;
  assignee?: UserDTO;
}

export interface CreateActionItemDTO extends BaseCreateDTO {
  meetingId: string;
  content: string;
  assigneeId: string;
  isCompleted?: boolean;
  relatedTaskId?: string;
}

export interface UpdateActionItemDTO extends BaseUpdateDTO {
  content?: string;
  assigneeId?: string;
  isCompleted?: boolean;
  relatedTaskId?: string;
}

// LeaveRequest DTOs
export interface LeaveRequestDTO extends BaseDTO {
  userId: string;
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'OTHER';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  user?: UserDTO;
  reviewer?: UserDTO;
}

export interface CreateLeaveRequestDTO extends BaseCreateDTO {
  userId: string;
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'OTHER';
  startDate: string;
  endDate: string;
  reason: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

export interface UpdateLeaveRequestDTO extends BaseUpdateDTO {
  leaveType?: 'ANNUAL' | 'SICK' | 'UNPAID' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'OTHER';
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// Request DTOs
export interface RequestDTO extends BaseDTO {
  userId: string;
  type: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details?: any;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  user?: UserDTO;
  reviewer?: UserDTO;
}


export interface UpdateRequestDTO extends BaseUpdateDTO {
  type?: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details?: any;
  reason?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// EmployeeDocument DTOs
export interface EmployeeDocumentDTO extends BaseDTO {
  userId: string;
  name: string;
  url: string;
  publicId: string;
  fileType: string;
  category: 'CONTRACT' | 'IDENTIFICATION' | 'CERTIFICATE' | 'PERFORMANCE_REVIEW' | 'MEDICAL' | 'PAYROLL' | 'OTHER';
  uploadedById: string;
  user?: UserDTO;
  uploadedBy?: UserDTO;
}

export interface CreateEmployeeDocumentDTO extends BaseCreateDTO {
  userId: string;
  name: string;
  url: string;
  publicId: string;
  fileType: string;
  category: 'CONTRACT' | 'IDENTIFICATION' | 'CERTIFICATE' | 'PERFORMANCE_REVIEW' | 'MEDICAL' | 'PAYROLL' | 'OTHER';
  uploadedById: string;
}

export interface UpdateEmployeeDocumentDTO extends BaseUpdateDTO {
  name?: string;
  url?: string;
  publicId?: string;
  fileType?: string;
  category?: 'CONTRACT' | 'IDENTIFICATION' | 'CERTIFICATE' | 'PERFORMANCE_REVIEW' | 'MEDICAL' | 'PAYROLL' | 'OTHER';
}

// ChecklistTemplate DTOs
export interface ChecklistTemplateDTO extends BaseDTO {
  name: string;
  type: 'ONBOARDING' | 'OFFBOARDING';
  description?: string;
  isActive: boolean;
  createdById: string;
  createdBy?: UserDTO;
  tasks?: ChecklistTemplateTaskDTO[];
  employeeChecklists?: EmployeeChecklistDTO[];
}

export interface CreateChecklistTemplateDTO extends BaseCreateDTO {
  name: string;
  type: 'ONBOARDING' | 'OFFBOARDING';
  description?: string;
  isActive?: boolean;
  createdById: string;
}

export interface UpdateChecklistTemplateDTO extends BaseUpdateDTO {
  name?: string;
  type?: 'ONBOARDING' | 'OFFBOARDING';
  description?: string;
  isActive?: boolean;
}

// ChecklistTemplateTask DTOs
export interface ChecklistTemplateTaskDTO extends BaseDTO {
  templateId: string;
  title: string;
  description?: string;
  defaultAssigneeRole: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  order: number;
  isRequired: boolean;
  estimatedDays?: number;
  template?: ChecklistTemplateDTO;
}

export interface CreateChecklistTemplateTaskDTO extends BaseCreateDTO {
  templateId: string;
  title: string;
  description?: string;
  defaultAssigneeRole: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  order?: number;
  isRequired?: boolean;
  estimatedDays?: number;
}

export interface UpdateChecklistTemplateTaskDTO extends BaseUpdateDTO {
  title?: string;
  description?: string;
  defaultAssigneeRole?: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  order?: number;
  isRequired?: boolean;
  estimatedDays?: number;
}

// EmployeeChecklist DTOs
export interface EmployeeChecklistDTO extends BaseDTO {
  employeeId: string;
  templateId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  completedAt?: string;
  notes?: string;
  employee?: UserDTO;
  template?: ChecklistTemplateDTO;
}

export interface CreateEmployeeChecklistDTO extends BaseCreateDTO {
  employeeId: string;
  templateId: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  notes?: string;
}

export interface UpdateEmployeeChecklistDTO extends BaseUpdateDTO {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedAt?: string;
  notes?: string;
}

// Attendance DTOs
export interface AttendanceDTO extends BaseDTO {
  userId: string;
  checkIn: string;
  checkOut?: string;
  user?: UserDTO;
}

export interface CreateAttendanceDTO extends BaseCreateDTO {
  userId: string;
  checkIn?: string;
  checkOut?: string;
}

export interface UpdateAttendanceDTO extends BaseUpdateDTO {
  checkIn?: string;
  checkOut?: string;
}

// ContentSlot DTOs
export interface ContentSlotDTO extends BaseDTO {
  title: string;
  description?: string;
  type: string;
  startDate: string;
  endDate: string;
  projectId?: string;
  project?: ProjectDTO;
}

export interface CreateContentSlotDTO extends BaseCreateDTO {
  title: string;
  description?: string;
  type?: string;
  startDate: string;
  endDate: string;
  projectId?: string;
}

export interface UpdateContentSlotDTO extends BaseUpdateDTO {
  title?: string;
  description?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  projectId?: string;
}

// WorkSchedule DTOs
export interface WorkScheduleDTO extends BaseDTO {
  userId: string;
  saturday: boolean;
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  user?: UserDTO;
}

export interface CreateWorkScheduleDTO extends BaseCreateDTO {
  userId: string;
  saturday?: boolean;
  sunday?: boolean;
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
}

export interface UpdateWorkScheduleDTO extends BaseUpdateDTO {
  saturday?: boolean;
  sunday?: boolean;
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
}

// Holiday DTOs
export interface HolidayDTO extends BaseDTO {
  name: string;
  date: string;
}

export interface CreateHolidayDTO extends BaseCreateDTO {
  name: string;
  date: string;
}

export interface UpdateHolidayDTO extends BaseUpdateDTO {
  name?: string;
  date?: string;
}

// AuditLog DTOs
export interface AuditLogDTO extends BaseDTO {
  eventType: string;
  details: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
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

// TrackedInstagramPage DTOs
export interface TrackedInstagramPageDTO extends BaseDTO {
  username: string;
  profileUrl: string;
  followerCount: number;
  status: string;
  reels?: InstagramReelDTO[];
}

export interface CreateTrackedInstagramPageDTO extends BaseCreateDTO {
  username: string;
  profileUrl: string;
  followerCount?: number;
  status?: string;
}

export interface UpdateTrackedInstagramPageDTO extends BaseUpdateDTO {
  username?: string;
  profileUrl?: string;
  followerCount?: number;
  status?: string;
}

// InstagramReel DTOs
export interface InstagramReelDTO extends BaseDTO {
  postUrl: string;
  shortCode: string;
  thumbnailUrl?: string;
  viewCount: number;
  publishedAt: string;
  pageId: number;
  trackedPage?: TrackedInstagramPageDTO;
}

export interface CreateInstagramReelDTO extends BaseCreateDTO {
  postUrl: string;
  shortCode: string;
  thumbnailUrl?: string;
  viewCount?: number;
  publishedAt: string;
  pageId: number;
}

export interface UpdateInstagramReelDTO extends BaseUpdateDTO {
  postUrl?: string;
  shortCode?: string;
  thumbnailUrl?: string;
  viewCount?: number;
  publishedAt?: string;
  pageId?: number;
}

// Entity type unions - comprehensive list based on Prisma schema
export type Entity = 
  | UserEntity
  | ProfileEntity
  | AnnouncementEntity
  | ProjectEntity
  | TaskEntity
  | DocumentEntity
  | StoryEntity
  | StoryTypeEntity
  | StoryIdeaEntity
  | MeetingEntity
  | MeetingAttendeeEntity
  | TalkingPointEntity
  | ActionItemEntity
  | LeaveRequestEntity
  | RequestEntity
  | EmployeeDocumentEntity
  | ChecklistTemplateEntity
  | ChecklistTemplateTaskEntity
  | EmployeeChecklistEntity
  | AttendanceEntity
  | ContentSlotEntity
  | WorkScheduleEntity
  | HolidayEntity
  | AuditLogEntity
  | TrackedInstagramPageEntity
  | InstagramReelEntity;

export type DTO = 
  | UserDTO
  | ProfileDTO
  | ProjectDTO
  | TaskDTO
  | DocumentDTO
  | StoryDTO
  | StoryTypeDTO
  | StoryIdeaDTO
  | MeetingDTO
  | MeetingAttendeeDTO
  | TalkingPointDTO
  | ActionItemDTO
  | LeaveRequestDTO
  | RequestDTO
  | AnnouncementDTO
  | EmployeeDocumentDTO
  | ChecklistTemplateDTO
  | ChecklistTemplateTaskDTO
  | EmployeeChecklistDTO
  | AttendanceDTO
  | ContentSlotDTO
  | WorkScheduleDTO
  | HolidayDTO
  | AuditLogDTO
  | TrackedInstagramPageDTO
  | InstagramReelDTO;

export type CreateDTO = 
  | CreateUserDTO
  | CreateProfileDTO
  | CreateProjectDTO
  | CreateTaskDTO
  | CreateDocumentDTO
  | CreateStoryDTO
  | CreateStoryTypeDTO
  | CreateStoryIdeaDTO
  | CreateMeetingDTO
  | CreateMeetingAttendeeDTO
  | CreateTalkingPointDTO
  | CreateActionItemDTO
  | CreateLeaveRequestDTO
  | CreateRequestDTO
  | CreateAnnouncementDTO
  | CreateEmployeeDocumentDTO
  | CreateChecklistTemplateDTO
  | CreateChecklistTemplateTaskDTO
  | CreateEmployeeChecklistDTO
  | CreateAttendanceDTO
  | CreateContentSlotDTO
  | CreateWorkScheduleDTO
  | CreateHolidayDTO
  | CreateAuditLogDTO
  | CreateTrackedInstagramPageDTO
  | CreateInstagramReelDTO;

export type UpdateDTO = 
  | UpdateUserDTO
  | UpdateProfileDTO
  | UpdateProjectDTO
  | UpdateTaskDTO
  | UpdateDocumentDTO
  | UpdateStoryDTO
  | UpdateStoryTypeDTO
  | UpdateStoryIdeaDTO
  | UpdateMeetingDTO
  | UpdateMeetingAttendeeDTO
  | UpdateTalkingPointDTO
  | UpdateActionItemDTO
  | UpdateLeaveRequestDTO
  | UpdateRequestDTO
  | UpdateAnnouncementDTO
  | UpdateEmployeeDocumentDTO
  | UpdateChecklistTemplateDTO
  | UpdateChecklistTemplateTaskDTO
  | UpdateEmployeeChecklistDTO
  | UpdateAttendanceDTO
  | UpdateContentSlotDTO
  | UpdateWorkScheduleDTO
  | UpdateHolidayDTO
  | UpdateAuditLogDTO
  | UpdateTrackedInstagramPageDTO
  | UpdateInstagramReelDTO;

// Entity name type - comprehensive list based on Prisma schema
export type EntityName = 
  | 'User'
  | 'Profile'
  | 'Announcement'
  | 'Project'
  | 'Task'
  | 'Document'
  | 'Story'
  | 'StoryType'
  | 'StoryIdea'
  | 'Meeting'
  | 'MeetingAttendee'
  | 'TalkingPoint'
  | 'ActionItem'
  | 'LeaveRequest'
  | 'Request'
  | 'EmployeeDocument'
  | 'ChecklistTemplate'
  | 'ChecklistTemplateTask'
  | 'EmployeeChecklist'
  | 'Attendance'
  | 'ContentSlot'
  | 'WorkSchedule'
  | 'Holiday'
  | 'AuditLog'
  | 'TrackedInstagramPage'
  | 'InstagramReel';

// Entity type mapping - comprehensive mapping based on Prisma schema
export type EntityTypeMap = {
  User: UserEntity;
  Profile: ProfileEntity;
  Announcement: AnnouncementEntity;
  Project: ProjectEntity;
  Task: TaskEntity;
  Document: DocumentEntity;
  Story: StoryEntity;
  StoryType: StoryTypeEntity;
  StoryIdea: StoryIdeaEntity;
  Meeting: MeetingEntity;
  MeetingAttendee: MeetingAttendeeEntity;
  TalkingPoint: TalkingPointEntity;
  ActionItem: ActionItemEntity;
  LeaveRequest: LeaveRequestEntity;
  Request: RequestEntity;
  EmployeeDocument: EmployeeDocumentEntity;
  ChecklistTemplate: ChecklistTemplateEntity;
  ChecklistTemplateTask: ChecklistTemplateTaskEntity;
  EmployeeChecklist: EmployeeChecklistEntity;
  Attendance: AttendanceEntity;
  ContentSlot: ContentSlotEntity;
  WorkSchedule: WorkScheduleEntity;
  Holiday: HolidayEntity;
  AuditLog: AuditLogEntity;
  TrackedInstagramPage: TrackedInstagramPageEntity;
  InstagramReel: InstagramReelEntity;
};

export type DTOTypeMap = {
  User: UserDTO;
  Profile: ProfileDTO;
  Project: ProjectDTO;
  Task: TaskDTO;
  Document: DocumentDTO;
  Story: StoryDTO;
  StoryType: StoryTypeDTO;
  StoryIdea: StoryIdeaDTO;
  Meeting: MeetingDTO;
  MeetingAttendee: MeetingAttendeeDTO;
  TalkingPoint: TalkingPointDTO;
  ActionItem: ActionItemDTO;
  LeaveRequest: LeaveRequestDTO;
  Request: RequestDTO;
  Announcement: AnnouncementDTO;
  EmployeeDocument: EmployeeDocumentDTO;
  ChecklistTemplate: ChecklistTemplateDTO;
  ChecklistTemplateTask: ChecklistTemplateTaskDTO;
  EmployeeChecklist: EmployeeChecklistDTO;
  Attendance: AttendanceDTO;
  ContentSlot: ContentSlotDTO;
  WorkSchedule: WorkScheduleDTO;
  Holiday: HolidayDTO;
  AuditLog: AuditLogDTO;
  TrackedInstagramPage: TrackedInstagramPageDTO;
  InstagramReel: InstagramReelDTO;
};

export type CreateDTOTypeMap = {
  User: CreateUserDTO;
  Profile: CreateProfileDTO;
  Project: CreateProjectDTO;
  Task: CreateTaskDTO;
  Document: CreateDocumentDTO;
  Story: CreateStoryDTO;
  StoryType: CreateStoryTypeDTO;
  StoryIdea: CreateStoryIdeaDTO;
  Meeting: CreateMeetingDTO;
  MeetingAttendee: CreateMeetingAttendeeDTO;
  TalkingPoint: CreateTalkingPointDTO;
  ActionItem: CreateActionItemDTO;
  LeaveRequest: CreateLeaveRequestDTO;
  Request: CreateRequestDTO;
  Announcement: CreateAnnouncementDTO;
  EmployeeDocument: CreateEmployeeDocumentDTO;
  ChecklistTemplate: CreateChecklistTemplateDTO;
  ChecklistTemplateTask: CreateChecklistTemplateTaskDTO;
  EmployeeChecklist: CreateEmployeeChecklistDTO;
  Attendance: CreateAttendanceDTO;
  ContentSlot: CreateContentSlotDTO;
  WorkSchedule: CreateWorkScheduleDTO;
  Holiday: CreateHolidayDTO;
  AuditLog: CreateAuditLogDTO;
  TrackedInstagramPage: CreateTrackedInstagramPageDTO;
  InstagramReel: CreateInstagramReelDTO;
};

export type UpdateDTOTypeMap = {
  User: UpdateUserDTO;
  Profile: UpdateProfileDTO;
  Project: UpdateProjectDTO;
  Task: UpdateTaskDTO;
  Document: UpdateDocumentDTO;
  Story: UpdateStoryDTO;
  StoryType: UpdateStoryTypeDTO;
  StoryIdea: UpdateStoryIdeaDTO;
  Meeting: UpdateMeetingDTO;
  MeetingAttendee: UpdateMeetingAttendeeDTO;
  TalkingPoint: UpdateTalkingPointDTO;
  ActionItem: UpdateActionItemDTO;
  LeaveRequest: UpdateLeaveRequestDTO;
  Request: UpdateRequestDTO;
  Announcement: UpdateAnnouncementDTO;
  EmployeeDocument: UpdateEmployeeDocumentDTO;
  ChecklistTemplate: UpdateChecklistTemplateDTO;
  ChecklistTemplateTask: UpdateChecklistTemplateTaskDTO;
  EmployeeChecklist: UpdateEmployeeChecklistDTO;
  Attendance: UpdateAttendanceDTO;
  ContentSlot: UpdateContentSlotDTO;
  WorkSchedule: UpdateWorkScheduleDTO;
  Holiday: UpdateHolidayDTO;
  AuditLog: UpdateAuditLogDTO;
  TrackedInstagramPage: UpdateTrackedInstagramPageDTO;
  InstagramReel: UpdateInstagramReelDTO;
};
