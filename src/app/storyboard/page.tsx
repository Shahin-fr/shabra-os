"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { formatJalaliDate } from "@/lib/date-utils";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { JalaliCalendar } from "@/components/ui/jalali-calendar";
import { CalendarIcon, Plus, Minus, Palette } from "lucide-react";

import { CreateStoryDialog } from "@/components/storyboard/CreateStoryDialog";
import { StoryCanvas } from "@/components/storyboard/StoryCanvas";
import { TemplatePalette } from "@/components/storyboard/TemplatePalette";

import { motion } from "framer-motion";
import { fetchStoriesByDay, fetchStoryTypes, storiesKeys, storyTypesKeys } from "@/lib/queries";
import { Story } from "@/types/story";
import { useStatusStore } from "@/stores/statusStore";

export default function StoryboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [slotCount, setSlotCount] = useState(8);
  
  // Global status store
  const { setStatus } = useStatusStore();

  // Initialize query client for cache invalidation
  const queryClient = useQueryClient();

  // Helper function to show error messages
  const showError = (message: string) => {
    setStatus('error', message);
  };

  // Use TanStack Query to fetch story types
  const { data: storyTypes = [], isLoading: storyTypesLoading, isError: storyTypesError } = useQuery({
    queryKey: storyTypesKeys.all,
    queryFn: fetchStoryTypes,
  });

  // Use TanStack Query to fetch stories for the selected date
  const { data: stories = [], isLoading: storiesLoading, isError: storiesError, error: storiesErrorDetails } = useQuery({
    queryKey: storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")),
    queryFn: () => fetchStoriesByDay(format(selectedDate, "yyyy-MM-dd")),
    retry: 2,
    retryDelay: 1000,
  });

  // Debug logging for stories error
  if (storiesError) {
    console.error("Stories error detected:", storiesErrorDetails);
  }

  // Mutation for deleting stories
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete story");
      }
      return response.json();
    },
    onMutate: async (storyId) => {
      // Show loading state
      setStatus('loading', 'در حال حذف استوری...');
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")) });

      // Snapshot the previous value
      const previousStories = queryClient.getQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")));

      // Optimistically remove the story
      queryClient.setQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")), (old: Story[] | undefined) => {
        if (!old) return old;
        return old.filter(story => story.id !== storyId);
      });

      // Return a context object with the snapshotted value
      return { previousStories };
    },
    onSuccess: () => {
      // Only invalidate on success to confirm the optimistic update
      queryClient.invalidateQueries({ queryKey: storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")) });
      
      // Show success message via global status
      setStatus('success', 'استوری با موفقیت حذف شد!');
    },
    onError: (err, storyId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStories) {
        queryClient.setQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")), context.previousStories);
      }
      // Show error message to user
      showError("حذف استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
    },
  });

  // Mutation for updating story order (drag and drop)
  const updateStoryOrderMutation = useMutation({
    mutationFn: async ({ storyId, order }: { storyId: string; order: number }) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order }),
      });
      if (!response.ok) {
        throw new Error("Failed to update story order");
      }
      return response.json();
    },
    onMutate: async ({ storyId, order }) => {
      // Show loading state
      setStatus('loading', 'در حال تغییر ترتیب...');
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")) });

      // Snapshot the previous value
      const previousStories = queryClient.getQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")));

      // Optimistically update to the new value
      queryClient.setQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")), (old: Story[] | undefined) => {
        if (!old) return old;
        return old.map(story => 
          story.id === storyId ? { ...story, order } : story
        );
      });

      // Return a context object with the snapshotted value
      return { previousStories };
    },
    onSuccess: () => {
      // Only invalidate on success to confirm the optimistic update
      queryClient.invalidateQueries({ queryKey: storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")) });
      
      // Show success message via global status
      setStatus('success', 'ترتیب استوری با موفقیت تغییر یافت!');
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStories) {
        queryClient.setQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")), context.previousStories);
      }
      // Show error message to user
      showError("تغییر ترتیب استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
    },
  });

  // Mutation for creating stories
  const createStoryMutation = useMutation({
    mutationFn: async (storyData: {
      title: string;
      day: string;
      order: number;
      storyTypeId?: string;
      notes?: string;
      visualNotes?: string;
      link?: string;
    }) => {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storyData),
      });
      if (!response.ok) {
        throw new Error("Failed to create story");
      }
      return response.json();
    },
    onMutate: async (storyData) => {
      // Show loading state
      setStatus('loading', 'در حال ایجاد استوری...');
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")) });

      // Snapshot the previous value
      const previousStories = queryClient.getQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")));

      // Create a temporary story for optimistic update
      const tempStory: Story = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: storyData.title,
        notes: storyData.notes,
        visualNotes: storyData.visualNotes,
        link: storyData.link,
        day: storyData.day,
        order: storyData.order,
        status: "DRAFT", // Default status for new stories
        storyType: storyData.storyTypeId ? { id: storyData.storyTypeId, name: "" } : undefined,
      };

      // Optimistically add the story
      queryClient.setQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")), (old: Story[] | undefined) => {
        if (!old) return [tempStory];
        return [...old, tempStory].sort((a, b) => a.order - b.order);
      });

      // Return a context object with the snapshotted value
      return { previousStories };
    },
    onSuccess: (newStory) => {
      // Replace the temporary story with the real one from server
      queryClient.setQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")), (old: Story[] | undefined) => {
        if (!old) return [newStory];
        return old.map(story => 
          story.id.startsWith('temp-') ? newStory : story
        ).sort((a, b) => a.order - b.order);
      });
      
      // Show success message via global status
      setStatus('success', 'استوری با موفقیت ایجاد شد!');
    },
    onError: (err, storyData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStories) {
        queryClient.setQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")), context.previousStories);
      }
      // Show error message to user
      showError("ایجاد استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
    },
  });

  // Mutation for updating stories
  const updateStoryMutation = useMutation({
    mutationFn: async ({ storyId, storyData }: { storyId: string; storyData: any }) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storyData),
      });
      if (!response.ok) {
        throw new Error("Failed to update story");
      }
      return response.json();
    },
    onMutate: async ({ storyId, storyData }) => {
      // Show loading state
      setStatus('loading', 'در حال بروزرسانی استوری...');
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")) });

      // Snapshot the previous value
      const previousStories = queryClient.getQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")));

      // Optimistically update the story
      queryClient.setQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")), (old: Story[] | undefined) => {
        if (!old) return old;
        return old.map(story => 
          story.id === storyId ? { ...story, ...storyData } : story
        );
      });

      // Return a context object with the snapshotted value
      return { previousStories };
    },
    onSuccess: () => {
      // Only invalidate on success to confirm the optimistic update
      queryClient.invalidateQueries({ queryKey: storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")) });
      
      // Show success message via global status
      setStatus('success', 'استوری با موفقیت بروزرسانی شد!');
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStories) {
        queryClient.setQueryData(storiesKeys.byDay(format(selectedDate, "yyyy-MM-dd")), context.previousStories);
      }
      // Show error message to user
      showError("بروزرسانی استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
    },
  });

  // Handle slot selection and editing with improved interaction model
  const handleSlotClick = (index: number) => {
    const story = stories.find(s => s.order === index + 1);
    
    if (selectedSlotIndex === index) {
      // Second click on already selected slot - open edit dialog
      if (story) {
        // Edit existing story
        setEditingStory(story);
        setIsEditing(true);
        setIsDialogOpen(true);
      } else {
        // Create new story in this slot
        handleCreateNewStory(index);
      }
    } else {
      // First click - select the slot
      setSelectedSlotIndex(index);
    }
  };

  // Handle add slot
  const handleAddSlot = () => {
    setSlotCount(prev => prev + 1);
  };

  // Handle remove slot with orphaned story deletion
  const handleRemoveSlot = async () => {
    if (slotCount <= 1) return;

    const newSlotCount = slotCount - 1;
    
    // Find stories that will be orphaned (order > newSlotCount)
    const orphanedStories = stories.filter(story => story.order > newSlotCount);
    
    // Delete orphaned stories from database using mutation
    if (orphanedStories.length > 0) {
      try {
        await Promise.all(
          orphanedStories.map(story => deleteStoryMutation.mutateAsync(story.id))
        );
      } catch {
        // Silent error handling
      }
    }
    
    setSlotCount(newSlotCount);
    
    // Clear selection if the selected slot is being removed
    if (selectedSlotIndex !== null && selectedSlotIndex >= newSlotCount) {
      setSelectedSlotIndex(null);
    }
  };

  // Handle drag and drop reordering
  const handleReorderStories = async (fromIndex: number, toIndex: number) => {
    const fromStory = stories.find(s => s.order === fromIndex + 1);
    
    if (!fromStory) return;

    try {
      // Use mutation to update story order
      await updateStoryOrderMutation.mutateAsync({
        storyId: fromStory.id,
          order: toIndex + 1,
      });
    } catch {
      // Silent error handling
    }
  };

  // Create new story in a specific slot
  const handleCreateNewStory = async (slotIndex: number) => {
    setIsCreating(true);
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      
      // Use mutation to create story
      const newStory = await createStoryMutation.mutateAsync({
          title: "استوری جدید",
          day: dateString,
          order: slotIndex + 1,
      });

        setEditingStory(newStory);
        setIsEditing(true);
        setIsDialogOpen(true);
    } catch {
      // Silent error handling
    } finally {
      setIsCreating(false);
    }
  };

  // Handle template application
  const handleTemplateClick = async (storyTypeId: string) => {
    if (selectedSlotIndex === null) return;

    const story = stories.find(s => s.order === selectedSlotIndex + 1);
    const storyType = storyTypes.find(t => t.id === storyTypeId);
    
    if (!storyType) return;

    setIsCreating(true);
    
    try {
      if (story) {
        // Update existing story using mutation
        await updateStoryMutation.mutateAsync({
          storyId: story.id,
          storyData: { storyTypeId },
        });
      } else {
        // Create new story for this slot using mutation
        const dateString = format(selectedDate, "yyyy-MM-dd");
        await createStoryMutation.mutateAsync({
            title: `${storyType.name} Story`,
            day: dateString,
            storyTypeId: storyTypeId,
            order: selectedSlotIndex + 1,
        });
      }
    } catch {
      // Silent error handling
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
      const dateString = format(selectedDate, "yyyy-MM-dd");
      
      const newStory = await createStoryMutation.mutateAsync({
        ...storyData,
        day: dateString,
        order: selectedSlotIndex! + 1,
      });

      setEditingStory(newStory);
      setIsEditing(true);
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
    if (!editingStory) return;
    
    setIsCreating(true);
    try {
      await updateStoryMutation.mutateAsync({
        storyId: editingStory.id,
        storyData,
      });
      
      setIsEditing(false);
      setIsDialogOpen(false);
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
    if (isEditing) {
      handleUpdateStory(storyData);
    } else {
      handleCreateStory(storyData);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingStory(null);
    setIsEditing(false);
  };

  return (
    <motion.div 
      className="container mx-auto max-w-7xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
        {/* Enhanced Date Selection and Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.2),
                0 10px 30px rgba(255, 10, 84, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.4)
              `
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold text-foreground">
                      انتخاب تاریخ
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-48 justify-start text-left font-normal border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#ff0a54]" />
                          {formatJalaliDate(selectedDate, 'yyyy/M/d')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <JalaliCalendar
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <CreateStoryDialog
                    isOpen={isDialogOpen}
                    onOpenChange={handleDialogClose}
                    onSubmit={handleDialogSubmit}
                    storyTypes={storyTypes}
                    isLoading={isCreating}
                    editingStory={editingStory}
                    isEditing={isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>



        {/* Enhanced Main Content - Canvas and Palette */}
        <div className="space-y-10">
          {/* Enhanced Story Canvas Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="storyboard-container"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 20px 60px rgba(0, 0, 0, 0.2),
                  0 10px 30px rgba(255, 10, 84, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4)
                `
              }}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">استوری بورد</h2>
                    <p className="text-muted-foreground">بوم بصری برای برنامه‌ریزی استوری‌ها</p>
                  </div>
                  
                  {/* Slot Counter - Now positioned on the left side, in line with the header */}
                  <div className="flex items-center bg-white border border-[#fdd6e8]/40 rounded-lg shadow-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveSlot}
                      disabled={slotCount <= 1}
                      className="h-10 w-10 p-0 rounded-r-none border-r border-[#fdd6e8]/30 hover:bg-[#fdd6e8]/10 disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4 text-[#ff0a54]" />
                    </Button>
                    <div className="px-4 py-2 text-sm font-medium text-foreground bg-[#fdd6e8]/5 min-w-[80px] text-center">
                      {slotCount} اسلات
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddSlot}
                      className="h-10 w-10 p-0 rounded-l-none border-l border-[#fdd6e8]/30 hover:bg-[#fdd6e8]/10"
                    >
                      <Plus className="h-4 w-4 text-[#ff0a54]" />
                    </Button>
                  </div>
                </div>
                
                {storiesError ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">خطا در بارگذاری استوری‌ها</h3>
                    <p className="text-muted-foreground mb-6">
                      مشکلی در بارگذاری استوری‌ها پیش آمده است
                    </p>
                    {storiesErrorDetails && (
                      <details className="text-xs text-red-600 mb-4">
                        <summary>جزئیات خطا (برای توسعه‌دهنده)</summary>
                        <pre className="mt-2 text-left direction-ltr">
                          {JSON.stringify(storiesErrorDetails, null, 2)}
                        </pre>
                      </details>
                    )}
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white"
                    >
                      تلاش مجدد
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    className="relative"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.08,
                          delayChildren: 0.3
                        }
                      }
                    }}
                  >
                    {/* No stories found message */}
                    {stories.length === 0 && (
                      <motion.div 
                        className="text-center py-8 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <motion.div 
                          className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                          style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(40px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: `
                              0 12px 35px rgba(255, 10, 84, 0.25),
                              inset 0 1px 0 rgba(255, 255, 255, 0.4)
                            `
                          }}
                        >
                          <Palette className="h-8 w-8 text-[#ff0a54]" />
                        </motion.div>
                        <p className="text-gray-800 text-lg mb-2">هیچ استوری برای این تاریخ یافت نشد</p>
                        <p className="text-sm text-gray-600">
                          یک اسلات انتخاب کنید و قالب انتخاب کنید تا شروع کنید
                        </p>
                      </motion.div>
                    )}
                    
                    <StoryCanvas
                      stories={stories}
                      selectedSlotIndex={selectedSlotIndex}
                      onSlotClick={handleSlotClick}
                      onReorderStories={handleReorderStories}
                      onClearSlot={handleClearSlot}
                      isLoading={isCreating}
                      slotCount={slotCount}
                    />
                    
                    {/* Loading overlay for initial load */}
                    {storiesLoading && (
                      <motion.div 
                        className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-lg z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-3 text-muted-foreground">در حال بارگذاری استوری‌ها...</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Template Palette Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="template-container"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 20px 60px rgba(0, 0, 0, 0.2),
                  0 10px 30px rgba(255, 10, 84, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4)
                `
              }}
            >
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">پالت قالب‌ها</h2>
                  <p className="text-muted-foreground">قالب‌های آماده برای استوری‌های مختلف</p>
                </div>
                
                {storyTypesLoading ? (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">در حال بارگذاری قالب‌ها...</p>
                  </motion.div>
                ) : storyTypesError ? (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">خطا در بارگذاری قالب‌ها</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      مشکلی در بارگذاری قالب‌ها پیش آمده است
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => window.location.reload()} 
                      className="bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white text-xs"
                    >
                      تلاش مجدد
                    </Button>
                  </motion.div>
                ) : (
                <TemplatePalette
                  storyTypes={storyTypes}
                  selectedSlotIndex={selectedSlotIndex}
                  onTemplateClick={handleTemplateClick}
                  isLoading={isCreating}
                />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
  );
}
