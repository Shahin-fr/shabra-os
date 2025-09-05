'use client';

import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns-jalali';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useStoryIdeas } from '@/hooks/useStoryIdeas';
import { showStatusMessage } from '@/lib/utils';
import { Story } from '@/types/story';

import { CompleteEditStoryModal } from './CompleteEditStoryModal';
import { CreateStoryDialog } from './CreateStoryDialog';
import { IdeaBank } from './IdeaBank';
import { StoryboardCanvas } from './StoryboardCanvas';
import { StoryTypePalette } from './StoryTypePalette';

interface StoryManagementProps {
  selectedDate: Date;
  stories: Story[];
  storyTypes: any[];
  isLoading: boolean;
  isError: boolean;
  errorDetails?: any;
  _slotCount: number;
  onSlotCountChange: (count: number) => void;
  _isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  _editingStory: Story | null;
  onEditingStoryChange: (story: Story | null) => void;
  _isEditing: boolean;
  onIsEditingChange: (editing: boolean) => void;
  _selectedSlotIndex: number | null;
  onSelectedSlotIndexChange: (index: number | null) => void;
  _refetchStories: () => Promise<any>;
}

export function StoryManagementNew({
  selectedDate,
  stories,
  storyTypes,
  isLoading,
  isError,
  errorDetails,
  _slotCount,
  onSlotCountChange,
  _isDialogOpen,
  onDialogOpenChange,
  _editingStory,
  onEditingStoryChange,
  _isEditing,
  onIsEditingChange,
  _selectedSlotIndex,
  onSelectedSlotIndexChange,
  _refetchStories,
}: StoryManagementProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isIdeaBankOpen, setIsIdeaBankOpen] = useState(false);
  const [isCompleteEditModalOpen, setIsCompleteEditModalOpen] = useState(false);
  const [selectedStoryType, setSelectedStoryType] = useState<string | null>(
    null
  );

  // Fetch story ideas
  const { data: storyIdeas = [], isLoading: storyIdeasLoading } =
    useStoryIdeas();

  // Simplified create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (storyData: {
      title: string;
      day: string;
      order: number;
      notes?: string;
      link?: string;
      storyTypeId?: string;
      projectId?: string;
      storyIdeaId?: string;
      customTitle?: string;
      type?: string;
      ideaId?: string;
    }) => {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create story');
      }

      return response.json();
    },
    onSuccess: async () => {
      showStatusMessage('استوری با موفقیت ایجاد شد!', 3000);

      // Direct refetch of the main storyboard query
      await _refetchStories();

      // Clear selected slot
      onSelectedSlotIndexChange(null);
    },
    onError: _error => {
      // Error handling is done in the mutation's onError callback
      showStatusMessage(
        'ایجاد استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );
    },
  });

  // Simplified update story mutation
  const updateStoryMutation = useMutation({
    mutationFn: async ({
      storyId,
      storyData,
    }: {
      storyId: string;
      storyData: {
        title?: string;
        notes?: string;
        link?: string;
        storyTypeId?: string;
        order?: number;
      };
    }) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update story');
      }

      return response.json();
    },
    onSuccess: async () => {
      showStatusMessage('استوری با موفقیت به‌روزرسانی شد!', 3000);

      // Direct refetch of the main storyboard query
      await _refetchStories();

      // Clear selected slot
      onSelectedSlotIndexChange(null);
    },
    onError: _error => {
      // Error handling is done in the mutation's onError callback
      showStatusMessage(
        'به‌روزرسانی استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );
    },
  });

  // Simplified delete story mutation
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete story');
      }

      return await response.json();
    },
    onSuccess: async () => {
      showStatusMessage('استوری با موفقیت حذف شد!', 3000);

      // Direct refetch of the main storyboard query
      await _refetchStories();
    },
    onError: _error => {
      // Error handling is done in the mutation's onError callback
      showStatusMessage(
        'حذف استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );
    },
  });

  // Handle slot click - new two-step workflow
  const handleSlotClick = (index: number) => {
    const story = stories.find(s => s.order === index + 1);

    if (_selectedSlotIndex === index) {
      // Second click on same slot
      if (story) {
        // Double-click to edit existing story
        onEditingStoryChange(story);
        onIsEditingChange(true);
        setIsCompleteEditModalOpen(true);
      } else {
        // Single click on empty slot - just select it for story type assignment
        // No action needed, just visual feedback
      }
    } else {
      // First click - select slot
      onSelectedSlotIndexChange(index);
    }
  };

  // Handle double-click for editing
  const handleSlotDoubleClick = (index: number) => {
    const story = stories.find(s => s.order === index + 1);
    if (story) {
      onEditingStoryChange(story);
      onIsEditingChange(true);
      setIsCompleteEditModalOpen(true);
    }
  };

  // Handle story type selection from palette
  const handleStoryTypeSelect = async (storyType: any) => {
    if (_selectedSlotIndex === null) return;

    setIsCreating(true);
    try {
      // Create story with story type - include required fields
      const storyData = {
        title: storyType.name,
        day: format(selectedDate, 'yyyy-MM-dd'), // Use Jalali date format
        order: _selectedSlotIndex + 1,
        type: storyType.name,
        customTitle: storyType.name,
        projectId: 'cmf5o9m110001u35cldria860', // Default project ID
        storyTypeId: storyType.id, // Use the actual story type ID
      };

      await createStoryMutation.mutateAsync(storyData);

      // Clear selection
      onSelectedSlotIndexChange(null);
      setSelectedStoryType(null);
    } catch (_error) {
      // Error handling is done in the mutation's onError callback
    } finally {
      setIsCreating(false);
    }
  };

  // Handle clear slot (delete story)
  const handleClearSlot = async (storyId: string) => {
    if (!storyId) {
      return;
    }

    try {
      await deleteStoryMutation.mutateAsync(storyId);
    } catch (_error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  // Handle add slot
  const handleAddSlot = () => {
    onSlotCountChange(_slotCount + 1);
  };

  // Handle remove slot
  const handleRemoveSlot = async () => {
    if (_slotCount <= 1) return;

    const newSlotCount = _slotCount - 1;
    const orphanedStories = stories.filter(story => story.order > newSlotCount);

    // Delete orphaned stories
    for (const story of orphanedStories) {
      try {
        await deleteStoryMutation.mutateAsync(story.id);
      } catch (_error) {
        // Error handling is done in the mutation's onError callback
      }
    }

    onSlotCountChange(newSlotCount);

    if (_selectedSlotIndex !== null && _selectedSlotIndex >= newSlotCount) {
      onSelectedSlotIndexChange(null);
    }
  };

  // Handle drag and drop reordering
  const handleReorderStories = async (fromIndex: number, toIndex: number) => {
    const fromStory = stories.find(s => s.order === fromIndex + 1);
    if (!fromStory) return;

    try {
      await updateStoryMutation.mutateAsync({
        storyId: fromStory.id,
        storyData: { order: toIndex + 1 },
      });
    } catch (_error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  // Handle idea selection from Idea Bank
  const handleIdeaSelect = (_idea: any) => {
    setIsIdeaBankOpen(false);
  };

  // Handle opening Idea Bank
  const handleOpenIdeaBank = () => {
    if (_editingStory?.type) {
      setSelectedStoryType(_editingStory.type);
    }
    setIsIdeaBankOpen(true);
  };

  // Handle story creation/update from Complete Edit Modal
  const handleCompleteEditSubmit = async (storyData: {
    title: string;
    notes?: string;
    link?: string;
    customTitle?: string;
    ideaId?: string;
  }) => {
    if (_editingStory) {
      // Update existing story
      setIsCreating(true);
      try {
        await updateStoryMutation.mutateAsync({
          storyId: _editingStory.id,
          storyData: {
            title: storyData.title,
            notes: storyData.notes,
            link: storyData.link,
          },
        });
        setIsCompleteEditModalOpen(false);
        onEditingStoryChange(null);
        onIsEditingChange(false);
      } catch (_error) {
        // Error handling is done in the mutation's onError callback
      } finally {
        setIsCreating(false);
      }
    } else {
      // Create new story
      if (_selectedSlotIndex === null) return;

      setIsCreating(true);
      try {
        const newStoryData = {
          title: storyData.title,
          day: format(selectedDate, 'yyyy-MM-dd'), // Use Jalali date format
          order: _selectedSlotIndex + 1,
          notes: storyData.notes,
          link: storyData.link,
          customTitle: storyData.customTitle,
          ideaId: storyData.ideaId,
          projectId: 'cmf5o9m110001u35cldria860', // Default project ID
          storyTypeId: 'cmf5qm8790002u38cwtdzuw1p', // Default story type ID (تعامل با مخاطب)
        };

        await createStoryMutation.mutateAsync(newStoryData);
        setIsCompleteEditModalOpen(false);
        onSelectedSlotIndexChange(null);
      } catch (_error) {
        // Error handling is done in the mutation's onError callback
      } finally {
        setIsCreating(false);
      }
    }
  };

  // Handle story deletion
  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStoryMutation.mutateAsync(storyId);
      setIsCompleteEditModalOpen(false);
      onEditingStoryChange(null);
      onIsEditingChange(false);
    } catch (_error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const handleDialogClose = (open: boolean) => {
    onDialogOpenChange(open);
    if (!open) {
      onEditingStoryChange(null);
      onIsEditingChange(false);
    }
  };

  if (isError) {
    return (
      <motion.div
        className='text-center py-12 mb-6'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Palette className='h-8 w-8 text-red-600' />
        </div>
        <h3 className='text-lg font-semibold text-foreground mb-2'>
          خطا در بارگذاری استوری‌ها
        </h3>
        <p className='text-muted-foreground mb-6'>
          مشکلی در بارگذاری استوری‌ها پیش آمده است
        </p>
        {errorDetails && (
          <details className='text-xs text-red-600 mb-4'>
            <summary>جزئیات خطا (برای توسعه‌دهنده)</summary>
            <pre className='mt-2 text-left direction-ltr'>
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </details>
        )}
        <Button
          onClick={() => window.location.reload()}
          className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
        >
          تلاش مجدد
        </Button>
      </motion.div>
    );
  }

  return (
    <div className='space-y-10'>
      {/* Story Canvas Section */}
      <StoryboardCanvas
        stories={stories}
        selectedSlotIndex={_selectedSlotIndex}
        onSlotClick={handleSlotClick}
        onSlotDoubleClick={handleSlotDoubleClick}
        onReorderStories={handleReorderStories}
        onClearSlot={handleClearSlot}
        isLoading={isCreating}
        slotCount={_slotCount}
        onAddSlot={handleAddSlot}
        onRemoveSlot={handleRemoveSlot}
        storiesError={isError}
        storiesErrorDetails={errorDetails}
        storiesLoading={isLoading}
      />

      {/* Story Type Palette Section */}
      <StoryTypePalette
        storyTypes={storyTypes}
        selectedSlotIndex={_selectedSlotIndex}
        onTypeSelect={handleStoryTypeSelect}
        isLoading={isCreating}
      />

      {/* Idea Bank Modal */}
      <IdeaBank
        isOpen={isIdeaBankOpen}
        onOpenChange={setIsIdeaBankOpen}
        onSelectIdea={handleIdeaSelect}
        storyIdeas={storyIdeas as any}
        isLoading={storyIdeasLoading}
        selectedStoryType={selectedStoryType || undefined}
      />

      {/* Complete & Edit Story Modal */}
      <CompleteEditStoryModal
        isOpen={isCompleteEditModalOpen}
        onOpenChange={setIsCompleteEditModalOpen}
        onSubmit={handleCompleteEditSubmit}
        onDelete={handleDeleteStory}
        onOpenIdeaBank={handleOpenIdeaBank}
        story={_editingStory}
        isLoading={isCreating}
      />

      {/* Legacy Create Story Dialog (kept for backward compatibility) */}
      <CreateStoryDialog
        isOpen={_isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={() => {}}
        storyTypes={storyTypes}
        isLoading={isCreating}
        editingStory={_editingStory}
        isEditing={_isEditing}
      />
    </div>
  );
}
