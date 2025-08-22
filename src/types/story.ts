export interface StoryType {
  id: string;
  name: string;
  icon?: string;
}

export interface Story {
  id: string;
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: string; // This comes as ISO string from API
  order: number;
  status: "DRAFT" | "READY" | "PUBLISHED";
  storyType?: {
    id: string;
    name: string;
    icon?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}
