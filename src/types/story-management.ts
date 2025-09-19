import { Story } from './story';

// Story Management Component Props
export interface StoryManagementProps {
  selectedDate: Date;
  stories: Story[];
  storyTypes: StoryType[];
  isLoading: boolean;
  isError: boolean;
  errorDetails?: ErrorDetails;
  slotCount: number;
  onSlotCountChange: (count: number) => void;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  editingStory: Story | null;
  onEditingStoryChange: (story: Story | null) => void;
  isEditing: boolean;
  onIsEditingChange: (editing: boolean) => void;
  selectedSlotIndex: number | null;
  onSelectedSlotIndexChange: (index: number | null) => void;
  refetchStories: () => Promise<void>;
}

// Story Type Interface
export interface StoryType {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color?: string;
  isActive: boolean;
}

// Error Details Interface
export interface ErrorDetails {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Story Creation/Update Data
export interface StoryData {
  title: string;
  notes?: string;
  link?: string;
  customTitle?: string;
  ideaId?: string;
  storyTypeId?: string;
  projectId?: string;
  day: string;
  order: number;
  type?: string;
}

// Story Management State
export interface StoryManagementState {
  isCreating: boolean;
  isIdeaBankOpen: boolean;
  isCompleteEditModalOpen: boolean;
  selectedStoryType: string | null;
}

// Story Management Actions
export interface StoryManagementActions {
  handleSlotClick: (index: number) => void;
  handleSlotDoubleClick: (index: number) => void;
  handleStoryTypeSelect: (storyType: StoryType) => Promise<void>;
  handleClearSlot: (storyId: string) => Promise<void>;
  handleAddSlot: () => void;
  handleRemoveSlot: () => Promise<void>;
  handleReorderStories: (fromIndex: number, toIndex: number) => Promise<void>;
  handleIdeaSelect: (idea: StoryIdea) => void;
  handleCompleteEditSubmit: (storyData: { title: string; notes?: string; link?: string; customTitle?: string; ideaId?: string }) => Promise<void>;
  handleDeleteStory: (storyId: string) => Promise<void>;
  handleDialogClose: (open: boolean) => void;
}

// Story Idea Interface
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

// Mutation States
export interface MutationState {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// Story Canvas Props
export interface StoryCanvasProps {
  stories: Story[];
  selectedSlotIndex: number | null;
  onSlotClick: (index: number) => void;
  onSlotDoubleClick: (index: number) => void;
  onReorderStories: (fromIndex: number, toIndex: number) => Promise<void>;
  onClearSlot: (storyId: string) => Promise<void>;
  isLoading: boolean;
  slotCount: number;
  onAddSlot: () => void;
  onRemoveSlot: () => Promise<void>;
  storiesError: boolean;
  storiesErrorDetails?: ErrorDetails;
  storiesLoading: boolean;
}

// Story Type Palette Props
export interface StoryTypePaletteProps {
  storyTypes: StoryType[];
  selectedSlotIndex: number | null;
  onTypeSelect: (storyType: StoryType) => Promise<void>;
  isLoading: boolean;
}

// Idea Bank Props
export interface IdeaBankProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectIdea: (idea: StoryIdea) => void;
  storyIdeas: StoryIdea[];
  isLoading: boolean;
  selectedStoryType?: string;
}

// Complete Edit Modal Props
export interface CompleteEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (storyData: { title: string; notes?: string; link?: string; customTitle?: string; ideaId?: string }) => Promise<void>;
  onDelete: (storyId: string) => Promise<void>;
  onSelectIdea: (idea: StoryIdea) => void;
  story: Story | null;
  storyIdeas: StoryIdea[];
  isLoading: boolean;
}
