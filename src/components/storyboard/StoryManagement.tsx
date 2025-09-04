'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns-jalali';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { showStatusMessage } from '@/lib/utils';
import { storiesKeys } from '@/lib/queries';
import { Story } from '@/types/story';

import { CreateStoryDialog } from './CreateStoryDialog';
import { StoryboardCanvas } from './StoryboardCanvas';
import { StoryboardPalette } from './StoryboardPalette';

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
}

export function StoryManagement({
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
}: StoryManagementProps) {
  const [isCreating, setIsCreating] = useState(false);

  const queryClient = useQueryClient();

  // Mutation for deleting stories
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          errorData = { error: { message: 'Failed to parse error response' } };
        }
        // Error handling is done in the mutation's onError callback
        throw new Error(
          `Failed to delete story: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      return response.json();
    },
    onMutate: async storyId => {
      showStatusMessage('در حال حذف استوری...', 2000);

      await queryClient.cancelQueries({
        queryKey: storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
      });

      const previousStories = queryClient.getQueryData(
        storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd'))
      );

      queryClient.setQueryData(
        storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
        (old: Story[] | undefined | null) => {
          if (!old || !Array.isArray(old)) return old;
          return old.filter(story => story.id !== storyId);
        }
      );

      return { previousStories };
    },
    onSuccess: () => {
      showStatusMessage('استوری با موفقیت حذف شد!', 3000);

      // DON'T invalidate queries - keep the optimistic update
      // The optimistic update already removes the story from UI
    },
    onError: (_err, _storyId, ____context) => {
      showStatusMessage(
        'حذف استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );

      // Context rollback is handled by the mutation's onError callback
    },
  });

  // Mutation for updating story order
  const updateStoryOrderMutation = useMutation({
    mutationFn: async ({
      storyId,
      order,
    }: {
      storyId: string;
      order: number;
    }) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Error handling is done in the mutation's onError callback
        throw new Error(
          `Failed to update story order: ${errorData.error?.message || 'Unknown error'}`
        );
      }
      return response.json();
    },
    onMutate: async ({ storyId, order }) => {
      showStatusMessage('در حال تغییر ترتیب...', 2000);

      await queryClient.cancelQueries({
        queryKey: storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
      });

      const previousStories = queryClient.getQueryData(
        storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd'))
      );

      queryClient.setQueryData(
        storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
        (old: Story[] | undefined | null) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map(story =>
            story.id === storyId ? { ...story, order } : story
          );
        }
      );

      return { previousStories };
    },
    onSuccess: _data => {
      showStatusMessage('ترتیب استوری با موفقیت تغییر یافت!', 3000);

      // Invalidate and refetch the stories
      queryClient.invalidateQueries({
        queryKey: storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
      });

      // Also invalidate all stories queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: storiesKeys.all,
      });
    },
    onError: (_err, _variables, ____context) => {
      showStatusMessage(
        'تغییر ترتیب استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );

      // Context rollback is handled by the mutation's onError callback
    },
  });

  // Handle slot selection and editing
  const handleSlotClick = (index: number) => {
    const story = stories.find(s => s.order === index + 1);

    if (_selectedSlotIndex === index) {
      if (story) {
        onEditingStoryChange(story);
        onIsEditingChange(true);
        onDialogOpenChange(true);
      } else {
        handleCreateNewStory(index);
      }
    } else {
      onSelectedSlotIndexChange(index);
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

    if (orphanedStories.length > 0) {
      try {
        await Promise.all(
          orphanedStories.map(story =>
            deleteStoryMutation.mutateAsync(story.id)
          )
        );
      } catch {
        // Silent error handling
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
      await updateStoryOrderMutation.mutateAsync({
        storyId: fromStory.id,
        order: toIndex + 1,
      });
    } catch {
      // Silent error handling
    }
  };

  // Create new story in a specific slot
  const handleCreateNewStory = async (_slotIndex: number) => {
    // Instead of creating the story immediately, just open the dialog
    // The story will be created when the user submits the dialog
    onEditingStoryChange(null);
    onIsEditingChange(false);
    onDialogOpenChange(true);
  };

  // Handle template application
  const handleTemplateClick = async (storyTypeId: string) => {
    if (_selectedSlotIndex === null) {
      return;
    }

    const story = stories.find(s => s.order === _selectedSlotIndex + 1);
    const storyType = storyTypes.find(t => t.id === storyTypeId);

    if (!storyType) {
      return;
    }

    setIsCreating(true);

    try {
      if (story) {
        await updateStoryMutation.mutateAsync({
          storyId: story.id,
          storyData: { storyTypeId },
        });
      } else {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        await createStoryMutation.mutateAsync({
          title: `${storyType.name} Story`,
          day: dateString,
          storyTypeId,
          order: _selectedSlotIndex + 1,
        });
      }
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    } finally {
      setIsCreating(false);
    }
  };

  // Handle clear slot (delete story)
  const handleClearSlot = async (storyId: string) => {
    try {
      await deleteStoryMutation.mutateAsync(storyId);
    } catch {
      // Silent error handling
    }
  };

  // Handle story creation from dialog
  const handleCreateStory = async (storyData: {
    title: string;
    notes?: string;
    visualNotes?: string;
    link?: string;
    storyTypeId?: string;
  }) => {
    setIsCreating(true);
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');

      await createStoryMutation.mutateAsync({
        ...storyData,
        day: dateString,
        order: _selectedSlotIndex! + 1,
      });

      // Close the dialog after successful creation
      onDialogOpenChange(false);
      onEditingStoryChange(null);
      onIsEditingChange(false);
    } catch {
      // Silent error handling
    } finally {
      setIsCreating(false);
    }
  };

  // Handle story update from dialog
  const handleUpdateStory = async (storyData: {
    title: string;
    notes?: string;
    visualNotes?: string;
    link?: string;
    storyTypeId?: string;
  }) => {
    if (!_editingStory) return;

    setIsCreating(true);
    try {
      await updateStoryMutation.mutateAsync({
        storyId: _editingStory.id,
        storyData,
      });

      // Close the dialog after successful update
      onDialogOpenChange(false);
      onEditingStoryChange(null);
      onIsEditingChange(false);
    } catch {
      // Silent error handling
    } finally {
      setIsCreating(false);
    }
  };

  const handleDialogSubmit = (storyData: {
    title: string;
    notes?: string;
    visualNotes?: string;
    link?: string;
    storyTypeId?: string;
  }) => {
    if (_isEditing) {
      handleUpdateStory(storyData);
    } else {
      handleCreateStory(storyData);
    }
  };

  const handleDialogClose = (open: boolean) => {
    onDialogOpenChange(open);
    if (!open) {
      onEditingStoryChange(null);
      onIsEditingChange(false);
    }
  };

  // Mutation for creating stories
  const createStoryMutation = useMutation({
    mutationFn: async (storyData: {
      title: string;
      day: string;
      order: number;
      notes?: string;
      visualNotes?: string;
      link?: string;
      storyTypeId?: string;
    }) => {
      // Get default project and story type if not provided
      let defaultStoryTypeId = storyData.storyTypeId || storyTypes[0]?.id;

      if (!defaultStoryTypeId) {
        // Try to create a default story type
        try {
          const storyTypeResponse = await fetch('/api/story-types', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: 'استوری عمومی',
              description: 'نوع پیش‌فرض برای استوری‌ها',
              icon: '📝',
            }),
          });

          if (storyTypeResponse.ok) {
            const storyTypeData = await storyTypeResponse.json();
            defaultStoryTypeId = storyTypeData.id;
          } else {
            throw new Error('Failed to create default story type');
          }
        } catch (error) {
          // Error handling is done in the mutation's onError callback
          throw new Error(
            'No story type available and failed to create default one.'
          );
        }
      }

      // Try to get or create a default project
      let defaultProjectId;
      try {
        const projectsResponse = await fetch('/api/projects');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          if (projectsData.data?.projects?.length > 0) {
            defaultProjectId = projectsData.data.projects[0].id;
          } else {
            // Create a default project
            const createProjectResponse = await fetch('/api/projects', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: 'Storyboard Project',
                description: 'Default project for storyboard stories',
                status: 'ACTIVE',
              }),
            });

            if (createProjectResponse.ok) {
              const projectData = await createProjectResponse.json();
              defaultProjectId = projectData.data.id;
            } else {
              throw new Error('Failed to create default project');
            }
          }
        } else {
          throw new Error('Failed to fetch projects');
        }
      } catch (error) {
        // Error handling is done in the mutation's onError callback
        throw new Error('Failed to get or create project');
      }

      const requestBody = {
        ...storyData,
        projectId: defaultProjectId,
        storyTypeId: defaultStoryTypeId,
      };

      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Error handling is done in the mutation's onError callback
        throw new Error(
          `Failed to create story: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const responseData = await response.json();

      return responseData;
    },
    onMutate: async storyData => {
      showStatusMessage('در حال ایجاد استوری...', 2000);

      await queryClient.cancelQueries({
        queryKey: storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
      });

      const previousStories = queryClient.getQueryData(
        storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd'))
      );

      // Optimistically add the new story
      const optimisticStory: Story = {
        id: `temp-${Date.now()}`,
        title: storyData.title,
        notes: storyData.notes || undefined,
        visualNotes: storyData.visualNotes || undefined,
        link: storyData.link || undefined,
        day: storyData.day,
        order: storyData.order,
        status: 'DRAFT' as const,
        storyType: storyData.storyTypeId
          ? {
              id: storyData.storyTypeId,
              name:
                storyTypes.find(t => t.id === storyData.storyTypeId)?.name ||
                'Unknown Type',
              icon: storyTypes.find(t => t.id === storyData.storyTypeId)?.icon,
            }
          : undefined,
      };

      queryClient.setQueryData(
        storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
        (old: Story[] | undefined | null) => {
          if (!old || !Array.isArray(old)) {
            return [optimisticStory];
          }

          // Check if there's already a story with the same order
          const existingStoryIndex = old.findIndex(
            story => story.order === optimisticStory.order
          );

          if (existingStoryIndex !== -1) {
            // Replace the existing story with the optimistic one
            const newStories = [...old];
            newStories[existingStoryIndex] = optimisticStory;

            return newStories;
          } else {
            // Insert the story at the correct position based on order
            const newStories = [...old];
            const insertIndex = newStories.findIndex(
              story => story.order > optimisticStory.order
            );

            if (insertIndex === -1) {
              // Insert at the end
              newStories.push(optimisticStory);
            } else {
              // Insert at the correct position
              newStories.splice(insertIndex, 0, optimisticStory);
            }

            return newStories;
          }
        }
      );

      return { previousStories };
    },
    onSuccess: data => {
      showStatusMessage('استوری با موفقیت ایجاد شد!', 3000);

      // Update the cache to replace temporary ID with real ID
      const realId = data.data?.story?.id;

      queryClient.setQueryData(
        storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
        (old: any) => {
          if (!old || !Array.isArray(old)) return old;

          const updated = old.map((story: any) => {
            // Find the story that matches the slot we just created
            if (
              story.id.startsWith('temp-') &&
              story.slotIndex === _selectedSlotIndex
            ) {
              if (realId) {
                return { ...story, id: realId };
              }
            }
            return story;
          });

          return updated;
        }
      );

      // Keep the slot selected to show the template was applied successfully
      // selectedSlotIndex state is now managed by parent component and won't be reset
    },
    onError: (_err, _storyData, _____context) => {
      // Error handling is done in the mutation's onError callback
      showStatusMessage(
        'ایجاد استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );

      // Context rollback is handled by the mutation's onError callback
    },
  });

  // Mutation for updating stories
  const updateStoryMutation = useMutation({
    mutationFn: async ({
      storyId,
      storyData,
    }: {
      storyId: string;
      storyData: {
        title?: string;
        notes?: string;
        visualNotes?: string;
        link?: string;
        storyTypeId?: string;
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
        // Error handling is done in the mutation's onError callback
        throw new Error(
          `Failed to update story: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const responseData = await response.json();

      return responseData;
    },
    onMutate: async ({ storyId, storyData }) => {
      showStatusMessage('در حال به‌روزرسانی استوری...', 2000);

      await queryClient.cancelQueries({
        queryKey: storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
      });

      const previousStories = queryClient.getQueryData(
        storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd'))
      );

      queryClient.setQueryData(
        storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
        (old: Story[] | undefined | null) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map(story => {
            if (story.id === storyId) {
              const updatedStory = { ...story, ...storyData };

              // If storyTypeId is being updated, also update the storyType object
              if (storyData.storyTypeId) {
                const storyType = storyTypes.find(
                  t => t.id === storyData.storyTypeId
                );
                if (storyType) {
                  updatedStory.storyType = {
                    id: storyType.id,
                    name: storyType.name,
                    icon: storyType.icon,
                  };
                }
              }

              return updatedStory;
            }
            return story;
          });
        }
      );

      return { previousStories };
    },
    onSuccess: _data => {
      showStatusMessage('استوری با موفقیت به‌روزرسانی شد!', 3000);

      // DON'T invalidate queries - keep the optimistic update
      // The optimistic update already shows the updated story, so we don't need to refetch

      // Keep the slot selected to show the template was applied successfully
      // Don't clear selectedSlotIndex here
    },
    onError: (_err, _variables, ____context) => {
      showStatusMessage(
        'به‌روزرسانی استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );

      // Context rollback is handled by the mutation's onError callback
    },
  });

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

      {/* Template Palette Section */}
      <StoryboardPalette
        storyTypes={storyTypes}
        selectedSlotIndex={_selectedSlotIndex}
        onTemplateClick={handleTemplateClick}
        isLoading={isCreating}
        storyTypesLoading={false}
        storyTypesError={false}
      />

      {/* Create Story Dialog */}
      <CreateStoryDialog
        isOpen={_isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={handleDialogSubmit}
        storyTypes={storyTypes}
        isLoading={isCreating}
        editingStory={_editingStory}
        isEditing={_isEditing}
      />
    </div>
  );
}
