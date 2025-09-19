'use client';

import { StoryManagementProps } from '@/types/story-management';
import { useStoryManagement } from '@/hooks/useStoryManagement';

import {
  CompleteEditModal,
  CreateStoryDialog,
  IdeaBank,
  StoryCanvas,
  StoryTypePalette,
} from './management';

export function StoryManagement({
  selectedDate,
  stories,
  storyTypes,
  isLoading,
  isError,
  errorDetails,
  slotCount,
  onSlotCountChange,
  isDialogOpen,
  onDialogOpenChange,
  editingStory,
  onEditingStoryChange,
  isEditing,
  onIsEditingChange,
  selectedSlotIndex,
  onSelectedSlotIndexChange,
  refetchStories,
}: StoryManagementProps) {
  const {
    state,
    setState,
    storyIdeas,
    storyIdeasLoading,
    actions,
  } = useStoryManagement({
    selectedDate,
    stories,
    selectedSlotIndex,
    editingStory,
    onSelectedSlotIndexChange,
    onEditingStoryChange,
    onIsEditingChange,
    onDialogOpenChange,
    refetchStories,
  });

  // Handle add slot
  const handleAddSlot = () => {
    onSlotCountChange(slotCount + 1);
  };

  // Handle remove slot
  const handleRemoveSlot = async () => {
    if (slotCount <= 1) return;

    const newSlotCount = slotCount - 1;
    const orphanedStories = stories.filter(story => story.order > newSlotCount);

    // Delete orphaned stories
    for (const story of orphanedStories) {
      try {
        await actions.handleClearSlot(story.id);
      } catch {
        // Error handled by mutation
      }
    }

    onSlotCountChange(newSlotCount);

    if (selectedSlotIndex !== null && selectedSlotIndex >= newSlotCount) {
      onSelectedSlotIndexChange(null);
    }
  };

  return (
    <div className='space-y-10'>
      {/* Story Canvas Section */}
      <StoryCanvas
        stories={stories}
        selectedSlotIndex={selectedSlotIndex}
        onSlotClick={actions.handleSlotClick}
        onSlotDoubleClick={actions.handleSlotDoubleClick}
        onReorderStories={actions.handleReorderStories}
        onClearSlot={actions.handleClearSlot}
        isLoading={state.isCreating}
        slotCount={slotCount}
        onAddSlot={handleAddSlot}
        onRemoveSlot={handleRemoveSlot}
        storiesError={isError}
        storiesErrorDetails={errorDetails}
        storiesLoading={isLoading}
      />

      {/* Story Type Palette Section */}
      <StoryTypePalette
        storyTypes={storyTypes}
        selectedSlotIndex={selectedSlotIndex}
        onTypeSelect={actions.handleStoryTypeSelect}
        isLoading={state.isCreating}
      />

      {/* Idea Bank Modal */}
      <IdeaBank
        isOpen={state.isIdeaBankOpen}
        onOpenChange={(open) => setState(prev => ({ ...prev, isIdeaBankOpen: open }))}
        onSelectIdea={actions.handleIdeaSelect}
        storyIdeas={storyIdeas}
        isLoading={storyIdeasLoading}
        selectedStoryType={state.selectedStoryType || undefined}
      />

      {/* Complete & Edit Story Modal */}
      <CompleteEditModal
        isOpen={state.isCompleteEditModalOpen}
        onOpenChange={(open) => setState(prev => ({ ...prev, isCompleteEditModalOpen: open }))}
        onSubmit={actions.handleCompleteEditSubmit}
        onDelete={actions.handleDeleteStory}
        onSelectIdea={actions.handleIdeaSelect}
        story={editingStory}
        storyIdeas={storyIdeas}
        isLoading={state.isCreating}
      />

      {/* Legacy Create Story Dialog (kept for backward compatibility) */}
      <CreateStoryDialog
        isOpen={isDialogOpen}
        onOpenChange={actions.handleDialogClose}
        onSubmit={() => {}}
        storyTypes={storyTypes}
        isLoading={state.isCreating}
        editingStory={editingStory}
        isEditing={isEditing}
      />
    </div>
  );
}

