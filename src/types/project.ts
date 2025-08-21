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
