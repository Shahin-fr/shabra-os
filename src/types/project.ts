export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
export type ProjectAccessLevel = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  startDate?: string | null;
  endDate?: string | null;
  accessLevel: ProjectAccessLevel;
  _count: {
    stories: number;
    tasks: number;
    members: number;
  };
}

export interface ProjectsResponse {
  projects: Project[];
  currentPage: number;
  totalPages: number;
  totalProjects: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
