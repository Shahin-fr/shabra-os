"use client";

import { useState, useEffect, useCallback } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Minus } from "lucide-react";
import { format } from "date-fns";

import { CreateStoryDialog } from "@/components/storyboard/CreateStoryDialog";
import { StoryCanvas } from "@/components/storyboard/StoryCanvas";
import { TemplatePalette } from "@/components/storyboard/TemplatePalette";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";

interface StoryType {
  id: string;
  name: string;
}

interface Story {
  id: string;
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: string;
  order: number;
  status: "DRAFT" | "READY" | "PUBLISHED";
  storyType?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export default function StoryboardPage() {

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [stories, setStories] = useState<Story[]>([]);
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [slotCount, setSlotCount] = useState(8);

  // Fetch story types
  const fetchStoryTypes = async () => {
    try {
      const response = await fetch("/api/story-types");
      if (response.ok) {
        const data = await response.json();
        setStoryTypes(data);
      } else {
        console.error("Failed to fetch story types");
      }
    } catch (error) {
      console.error("Error fetching story types:", error);
    }
  };

  // Fetch stories for the selected date
  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`/api/stories?day=${dateString}`);
      if (response.ok) {
        const data = await response.json();
        setStories(data);
      } else {
        console.error("Failed to fetch stories");
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchStoryTypes();
  }, []);

  useEffect(() => {
    fetchStories();
  }, [selectedDate, fetchStories]);

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
    
    // Delete orphaned stories from database
    if (orphanedStories.length > 0) {
      try {
        await Promise.all(
          orphanedStories.map(story =>
            fetch(`/api/stories/${story.id}`, {
              method: "DELETE",
            })
          )
        );
      } catch (error) {
        console.error("Error deleting orphaned stories:", error);
      }
    }
    
    setSlotCount(newSlotCount);
    
    // Clear selection if the selected slot is being removed
    if (selectedSlotIndex !== null && selectedSlotIndex >= newSlotCount) {
      setSelectedSlotIndex(null);
    }
    
    // Refresh stories to reflect the changes
    fetchStories();
  };

  // Handle drag and drop reordering
  const handleReorderStories = async (fromIndex: number, toIndex: number) => {
    const fromStory = stories.find(s => s.order === fromIndex + 1);
    
    if (!fromStory) return;

    try {
      // Update the dragged story's order
      const response = await fetch(`/api/stories/${fromStory.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: toIndex + 1,
        }),
      });

      if (response.ok) {
        fetchStories();
      } else {
        console.error("Failed to reorder story");
      }
    } catch (error) {
      console.error("Error reordering story:", error);
    }
  };

  // Create new story in a specific slot
  const handleCreateNewStory = async (slotIndex: number) => {
    setIsCreating(true);
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "استوری جدید",
          day: dateString,
          order: slotIndex + 1,
          status: "DRAFT",
        }),
      });

      if (response.ok) {
        const newStory = await response.json();
        setEditingStory(newStory);
        setIsEditing(true);
        setIsDialogOpen(true);
        fetchStories();
      } else {
        console.error("Failed to create story");
      }
    } catch (error) {
      console.error("Error creating story:", error);
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
        // Update existing story
        const response = await fetch(`/api/stories/${story.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storyTypeId: storyTypeId,
          }),
        });

                 if (response.ok) {
           fetchStories();
           setShowSuccess(true);
           setTimeout(() => setShowSuccess(false), 3000);
         } else {
           console.error("Failed to update story");
         }
      } else {
        // Create new story for this slot
        const dateString = format(selectedDate, "yyyy-MM-dd");
        const response = await fetch("/api/stories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `${storyType.name} Story`,
            day: dateString,
            storyTypeId: storyTypeId,
            order: selectedSlotIndex + 1,
          }),
        });

                 if (response.ok) {
           fetchStories();
           setShowSuccess(true);
           setTimeout(() => setShowSuccess(false), 3000);
         } else {
           console.error("Failed to create story");
         }
      }
    } catch (error) {
      console.error("Error updating story:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle clear slot (delete story)
  const handleClearSlot = async (storyId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchStories();
        // Clear selection if the cleared slot was selected
        const clearedStory = stories.find(s => s.id === storyId);
        if (clearedStory && selectedSlotIndex === clearedStory.order - 1) {
          setSelectedSlotIndex(null);
        }
      } else {
        console.error("Failed to delete story");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  // Create new story
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
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...storyData,
          day: dateString,
        }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingStory(null);
        setIsEditing(false);
        fetchStories();
      } else {
        console.error("Failed to create story");
      }
    } catch (error) {
      console.error("Error creating story:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Update existing story
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
      const response = await fetch(`/api/stories/${editingStory.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storyData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingStory(null);
        setIsEditing(false);
        fetchStories();
      } else {
        console.error("Failed to update story");
      }
    } catch (error) {
      console.error("Error updating story:", error);
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
    <MainLayout>
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
                          {format(selectedDate, "yyyy/M/d")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
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

        {/* Enhanced Success Message */}
        {showSuccess && (
          <motion.div 
            className="fixed top-4 right-4 bg-primary/20 border border-primary/40 text-primary px-4 py-3 rounded-lg shadow-lg z-50 backdrop-blur-sm"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="font-medium">قالب با موفقیت اعمال شد!</span>
            </div>
          </motion.div>
        )}

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
                
                {isLoading ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-3 text-muted-foreground">در حال بارگذاری استوری‌ها...</p>
                  </motion.div>
                ) : (
                  <motion.div
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
                    <StoryCanvas
                      stories={stories}
                      selectedSlotIndex={selectedSlotIndex}
                      onSlotClick={handleSlotClick}
                      onReorderStories={handleReorderStories}
                      onClearSlot={handleClearSlot}
                      isLoading={isCreating}
                      slotCount={slotCount}
                    />
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
                
                <TemplatePalette
                  storyTypes={storyTypes}
                  selectedSlotIndex={selectedSlotIndex}
                  onTemplateClick={handleTemplateClick}
                  isLoading={isCreating}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
