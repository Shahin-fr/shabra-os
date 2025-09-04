export interface StoryType {
  id: string;
  name: string;
  icon?: string;
}

export interface StoryIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  storyType: string; // High-level story type this idea belongs to
  template: string;
  guidelines: string;
  icon?: string;
  isActive: boolean;
}

export interface Story {
  id: string;
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: string; // This comes as ISO string from API
  order: number;
  status: 'DRAFT' | 'READY' | 'PUBLISHED';
  customTitle?: string; // Custom title for specific day
  type?: string; // High-level story type for quick planning
  ideaId?: string; // Specific idea from idea bank
  storyType?: {
    id: string;
    name: string;
    icon?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  storyIdea?: StoryIdea;
}
