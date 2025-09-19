/**
 * Shared types for Profile Hub module
 * Centralized type definitions to eliminate duplication
 */

export interface ProfileUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  id: string;
  jobTitle?: string;
  department?: string;
  startDate?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface ManagerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface SubordinateInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  roles: string;
}

export interface TaskCounts {
  Todo: number;
  InProgress: number;
  Done: number;
}

export interface LeaveCounts {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  CANCELLED: number;
}

export interface PerformanceData {
  taskCounts: TaskCounts;
  projectCount: number;
  attendanceCount: number;
  leaveCounts: LeaveCounts;
}

export interface ProjectInfo {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface RecentTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface CompleteProfileData {
  user: ProfileUser;
  profile?: ProfileData;
  manager?: ManagerInfo;
  subordinates: SubordinateInfo[];
  performance: PerformanceData;
  projects: ProjectInfo[];
  recentTasks: RecentTask[];
}

// Team page specific types
export interface TeamProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    jobTitle?: string;
    department?: string;
  };
  manager?: {
    firstName: string;
    lastName: string;
  };
  taskCount: number;
  subordinateCount: number;
  taskStats: TaskCounts;
}
