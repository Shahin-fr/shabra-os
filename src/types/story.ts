export interface StoryType {
  id: string;
  name: string;
}

export interface Story {
  id: string;
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: string;
  order: number;
  storyType?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
}
