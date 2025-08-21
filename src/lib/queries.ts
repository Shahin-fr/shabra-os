import { Project, ProjectsResponse } from "@/types/project";
import { Story, StoryType } from "@/types/story";

// Projects queries
export const projectsKeys = {
  all: ["projects"] as const,
  lists: () => [...projectsKeys.all, "list"] as const,
  list: (filters: string) => [...projectsKeys.lists(), { filters }] as const,
  details: () => [...projectsKeys.all, "detail"] as const,
  detail: (id: string) => [...projectsKeys.details(), id] as const,
  byPage: (page: number) => [...projectsKeys.all, "page", page] as const,
};

export const fetchProjects = async (page: number = 1): Promise<ProjectsResponse> => {
  const response = await fetch(`/api/projects?page=${page}&limit=20`);
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return response.json();
};

export const fetchProject = async (id: string): Promise<Project> => {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }
  return response.json();
};

// Tasks queries
export const tasksKeys = {
  all: ["tasks"] as const,
  lists: () => [...tasksKeys.all, "list"] as const,
  list: (filters: string) => [...tasksKeys.lists(), { filters }] as const,
  details: () => [...tasksKeys.all, "detail"] as const,
  detail: (id: string) => [...tasksKeys.details(), id] as const,
};

export const fetchTasks = async (): Promise<any[]> => {
  const response = await fetch("/api/tasks");
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
};

// Stories queries
export const storiesKeys = {
  all: ["stories"] as const,
  lists: () => [...storiesKeys.all, "list"] as const,
  list: (filters: string) => [...storiesKeys.lists(), { filters }] as const,
  details: () => [...storiesKeys.all, "detail"] as const,
  detail: (id: string) => [...storiesKeys.details(), id] as const,
  byDay: (day: string) => [...storiesKeys.all, "day", day] as const,
};

export const fetchStories = async (): Promise<Story[]> => {
  const response = await fetch("/api/stories");
  if (!response.ok) {
    throw new Error("Failed to fetch stories");
  }
  return response.json();
};

export const fetchStoriesByDay = async (day: string): Promise<Story[]> => {
  const response = await fetch(`/api/stories?day=${day}`);
  if (!response.ok) {
    throw new Error("Failed to fetch stories for the specified day");
  }
  return response.json();
};

// Story Types queries
export const storyTypesKeys = {
  all: ["storyTypes"] as const,
  lists: () => [...storyTypesKeys.all, "list"] as const,
  list: (filters: string) => [...storyTypesKeys.lists(), { filters }] as const,
  details: () => [...storyTypesKeys.all, "detail"] as const,
  detail: (id: string) => [...storyTypesKeys.details(), id] as const,
};

export const fetchStoryTypes = async (): Promise<StoryType[]> => {
  const response = await fetch("/api/story-types");
  if (!response.ok) {
    throw new Error("Failed to fetch story types");
  }
  return response.json();
};

// Content Calendar queries
export const contentCalendarKeys = {
  all: ["contentCalendar"] as const,
  lists: () => [...contentCalendarKeys.all, "list"] as const,
  list: (filters: string) => [...contentCalendarKeys.lists(), { filters }] as const,
  byWeek: (weekStart: string) => [...contentCalendarKeys.all, "week", weekStart] as const,
  details: () => [...contentCalendarKeys.all, "detail"] as const,
  detail: (id: string) => [...contentCalendarKeys.details(), id] as const,
};

export const fetchContentSlotsByWeek = async (weekStart: string): Promise<any[]> => {
  const response = await fetch(`/api/content-slots?weekStart=${weekStart}`);
  if (!response.ok) {
    throw new Error("Failed to fetch content slots for the specified week");
  }
  return response.json();
};
