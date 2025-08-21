export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  createdAt: string;
  updatedAt: string;
  _count: {
    stories: number;
    tasks: number;
  };
}

export interface ProjectsResponse {
  projects: Project[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
