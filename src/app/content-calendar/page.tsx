'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Calendar,
  FileText,
  Image,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';

import { MobileContentCalendar } from '@/components/calendar/MobileContentCalendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMobile } from '@/hooks/useResponsive';
import {
  formatJalaliDate,
  formatJalaliMonthYear,
  persianDays,
} from '@/lib/date-utils';
import { logger } from '@/lib/logger';
import { showStatusMessage } from '@/lib/utils';

// Content type options
const contentTypes = [
  { value: 'STORY', label: 'استوری', icon: Image },
  { value: 'POST', label: 'پست', icon: FileText },
];

// Query key factory for content slots
const contentSlotsKeys = {
  all: ['content-slots'] as const,
  byWeek: (weekStart: string) =>
    [...contentSlotsKeys.all, 'week', weekStart] as const,
};

interface ContentSlot {
  id: string;
  title: string;
  type: 'STORY' | 'POST';
  description?: string;
  startDate: string;
  endDate: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateContentData {
  title: string;
  type: 'STORY' | 'POST';
  dayOfWeek: number;
  weekStart: string;
  notes?: string;
  projectId?: string;
}

export default function ContentCalendarPage() {
  const isMobile = useMobile();
  const [currentWeek, setCurrentWeek] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 6 }); // Saturday
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentSlot | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [activeContent, setActiveContent] = useState<ContentSlot | null>(null);
  const queryClient = useQueryClient();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Generate week days starting from Saturday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(currentWeek, i);
    return {
      date: day,
      dayOfWeek: i,
      persianName: persianDays[i] || 'نامشخص',
      gregorianDate: format(day, 'MMM d'),
      jalaliDate: formatJalaliDate(day, 'M/d'),
    };
  });

  // Fetch content slots for the current week
  const {
    data: contentSlots = [],
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useQuery({
    queryKey: contentSlotsKeys.byWeek(format(currentWeek, 'yyyy-MM-dd')),
    queryFn: async () => {
      try {
        const weekStart = format(currentWeek, 'yyyy-MM-dd');
        const response = await fetch(
          `/api/content-slots?weekStart=${weekStart}`,
          {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch content slots');
        const result = await response.json();

        // Extract data from the API response structure
        if (result.success && result.data) {
          return result.data;
        }

        throw new Error('Invalid response structure from content slots API');
      } catch (error) {
        logger.error('Failed to fetch content slots:', error as Error);
        return []; // Return empty array on error
      }
    },
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });

  // Create content mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateContentData) => {
      // Convert the data to match API expectations
      const apiData = {
        title: data.title,
        startDate: new Date(
          addDays(new Date(data.weekStart), data.dayOfWeek)
        ).toISOString(),
        endDate: new Date(
          addDays(new Date(data.weekStart), data.dayOfWeek)
        ).toISOString(),
        projectId: data.projectId,
        description: data.notes,
      };

      const response = await fetch('/api/content-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify(apiData),
      });
      if (!response.ok) throw new Error('Failed to create content');
      const result = await response.json();

      // Extract data from the API response structure
      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Invalid response structure from content creation API');
    },
    onMutate: async () => {
      // Show loading message
      showStatusMessage('در حال ایجاد محتوا...', 2000);

      // Cancel any outgoing refetches for content slots
      await queryClient.cancelQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });

      // Snapshot the previous value
      const previousContentSlots = queryClient.getQueriesData({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });

      return { previousContentSlots };
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setEditingContent(null);
      setIsEditing(false);

      showStatusMessage('محتوای جدید با موفقیت ایجاد شد', 3000);

      // Invalidate and refetch content slots queries to update the UI
      queryClient.invalidateQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
      queryClient.refetchQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
    },
    onError: (error, _variables, context) => {
      showStatusMessage(`خطا در ایجاد محتوا: ${error.message}`, 3000);

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousContentSlots) {
        context.previousContentSlots.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/content-slots/${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      if (!response.ok) throw new Error('Failed to delete content');
      const result = await response.json();

      // Extract data from the API response structure
      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Invalid response structure from content deletion API');
    },
    onMutate: async () => {
      // Show loading message
      showStatusMessage('در حال حذف محتوا...', 2000);

      // Cancel any outgoing refetches for content slots
      await queryClient.cancelQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });

      // Snapshot the previous value
      const previousContentSlots = queryClient.getQueriesData({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });

      return { previousContentSlots };
    },
    onSuccess: () => {
      showStatusMessage('محتوایی با موفقیت حذف شد', 3000);

      // Invalidate and refetch content slots queries to update the UI
      queryClient.invalidateQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
      queryClient.refetchQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
    },
    onError: (error, _variables, context) => {
      showStatusMessage(`خطا در حذف محتوا: ${error.message}`, 3000);

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousContentSlots) {
        context.previousContentSlots.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  // Update content day mutation
  const updateContentDayMutation = useMutation({
    mutationFn: async ({
      contentId,
      newDate,
    }: {
      contentId: string;
      newDate: Date;
    }) => {
      const response = await fetch(`/api/content-slots/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify({
          startDate: newDate.toISOString(),
          endDate: newDate.toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to update content day');
      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Invalid response structure from content day update API');
    },
    onMutate: async () => {
      // Cancel any outgoing refetches for content slots
      await queryClient.cancelQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
    },
    onSuccess: () => {
      showStatusMessage('محتوا با موفقیت جابه‌جا شد', 3000);

      // Invalidate and refetch content slots queries to update the UI
      queryClient.invalidateQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
      queryClient.refetchQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
    },
    onError: error => {
      showStatusMessage(`خطا در جابه‌جایی محتوا: ${error.message}`, 3000);
    },
  });

  const handleCreateContent = (data: CreateContentData) => {
    createMutation.mutate(data);
  };

  const handleDeleteContent = (id: string) => {
    if (window.confirm('آیا از حذف این محتوا اطمینان دارید؟')) {
      deleteMutation.mutate(id);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedContent = contentSlots.find(
      (content: ContentSlot) => content.id === active.id
    );
    setActiveContent(draggedContent || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && activeContent) {
      const targetDay = weekDays.find(
        day => day.dayOfWeek.toString() === over?.id
      );

      if (targetDay) {
        const newDate = targetDay.date;
        updateContentDayMutation.mutate({
          contentId: activeContent.id,
          newDate,
        });
      }
    }

    setActiveContent(null);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newWeek = new Date(prev);
      if (direction === 'next') {
        newWeek.setDate(newWeek.getDate() + 7);
      } else {
        newWeek.setDate(newWeek.getDate() - 7);
      }
      return newWeek;
    });
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 6 }));
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen) {
      setEditingContent(null);
      setIsEditing(false);
    }
  }, [isCreateDialogOpen]);

  // Show mobile components for mobile devices
  if (isMobile) {
    return <MobileContentCalendar />;
  }

  return (
    <motion.div
      className='container mx-auto max-w-7xl p-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='mb-8'
      >
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.2),
              0 10px 30px rgba(255, 10, 84, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.4)
            `,
          }}
        >
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-foreground mb-2'>
                  تقویم محتوا
                </h1>
                <p className='text-muted-foreground'>
                  برنامه‌ریزی هفتگی محتوا و استوری‌ها
                </p>
              </div>

              <div className='flex items-center gap-4'>
                <Button
                  onClick={goToCurrentWeek}
                  variant='outline'
                  className='bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200 hover:border-pink-300'
                >
                  <Calendar className='mr-2 h-4 w-4 text-pink-600' />
                  هفته جاری
                </Button>

                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className='bg-pink-100 text-pink-700 hover:bg-pink-200'>
                      <Plus className='mr-2 h-4 w-4' />
                      محتوای جدید
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[500px]'>
                    <DialogHeader>
                      <DialogTitle>
                        {isEditing ? 'ویرایش محتوا' : 'محتوای جدید'}
                      </DialogTitle>
                    </DialogHeader>
                    <ContentForm
                      onSubmit={handleCreateContent}
                      onCancel={() => setIsCreateDialogOpen(false)}
                      editingContent={editingContent}
                      weekDays={weekDays}
                      currentWeek={currentWeek}
                      isLoading={createMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Week Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='mb-6'
      >
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <Button
                onClick={() => navigateWeek('prev')}
                variant='ghost'
                size='sm'
                className='hover:bg-[#ff0a54]/10'
              >
                هفته قبل
              </Button>

              <div className='text-center'>
                <h3 className='text-lg font-semibold text-foreground'>
                  {formatJalaliMonthYear(currentWeek)}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {formatJalaliDate(currentWeek, 'M/d')} -{' '}
                  {formatJalaliDate(addDays(currentWeek, 6), 'M/d/yyyy')}
                </p>
              </div>

              <Button
                onClick={() => navigateWeek('next')}
                variant='ghost'
                size='sm'
                className='hover:bg-[#ff0a54]/10'
              >
                هفته بعد
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='grid grid-cols-7 gap-4'
        >
          {weekDays.map((day, index) => {
            const dayContent = contentSlots.filter((slot: ContentSlot) => {
              const slotDate = new Date(slot.startDate);
              const dayDate = day.date;
              return (
                slotDate.getDate() === dayDate.getDate() &&
                slotDate.getMonth() === dayDate.getMonth() &&
                slotDate.getFullYear() === dayDate.getFullYear()
              );
            });

            return (
              <DroppableDayColumn
                key={day.dayOfWeek}
                day={day}
                dayContent={dayContent}
                index={index}
                onEdit={content => {
                  setEditingContent(content);
                  setIsEditing(true);
                  setIsCreateDialogOpen(true);
                }}
                onDelete={handleDeleteContent}
                isLoadingSlots={isLoadingSlots}
                slotsError={slotsError}
              />
            );
          })}
        </motion.div>

        <DragOverlay>
          {activeContent ? (
            <ContentCard
              content={activeContent}
              onEdit={() => {}}
              onDelete={() => {}}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}

// Droppable Day Column Component
function DroppableDayColumn({
  day,
  dayContent,
  index,
  onEdit,
  onDelete,
  isLoadingSlots,
  slotsError,
}: {
  day: {
    dayOfWeek: number;
    persianName: string;
    jalaliDate: string;
    gregorianDate: string;
    date: Date;
  };
  dayContent: ContentSlot[];
  index: number;
  onEdit: (_content: ContentSlot) => void;
  onDelete: (_id: string) => void;
  isLoadingSlots: boolean;
  slotsError: unknown;
}) {
  const { setNodeRef } = useDroppable({ id: day.dayOfWeek.toString() });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className='flex flex-col'
    >
      {/* Day Header */}
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
        className='mb-3'
      >
        <CardContent className='p-3 text-center'>
          <div className='text-sm font-medium text-foreground mb-1'>
            {day.persianName}
          </div>
          <div className='text-xs text-muted-foreground'>
            {day.jalaliDate} / {day.gregorianDate}
          </div>
        </CardContent>
      </Card>

      {/* Content Column */}
      <div
        ref={setNodeRef}
        className='min-h-[400px] max-h-[600px] bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3 overflow-auto'
      >
        {isLoadingSlots ? (
          <div className='text-center text-muted-foreground text-sm py-8'>
            <div className='w-6 h-6 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-2'></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : slotsError ? (
          <div className='text-center text-red-500 text-sm py-8'>
            <p>خطا در بارگذاری محتوا</p>
            <p className='text-xs mt-1'>لطفاً صفحه را تازه کنید</p>
          </div>
        ) : dayContent.length > 0 ? (
          <AnimatePresence>
            {dayContent.map((content: ContentSlot) => (
              <motion.div
                key={content.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className='mb-3'
              >
                <DraggableContentCard
                  content={content}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          /* Empty State */
          <div className='text-center text-muted-foreground text-sm py-8'>
            <FileText className='h-8 w-8 mx-auto mb-2 opacity-50' />
            <p>محتوایی برای این روز وجود ندارد</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Draggable Content Card Component
function DraggableContentCard({
  content,
  onEdit,
  onDelete,
}: {
  content: ContentSlot;
  onEdit: (_content: ContentSlot) => void;
  onDelete: (_id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <ContentCard
        content={content}
        onEdit={() => onEdit(content)}
        onDelete={() => onDelete(content.id)}
        isDragging={isDragging}
      />
    </div>
  );
}

// Content Card Component
function ContentCard({
  content,
  onEdit,
  onDelete,
  isDragging = false,
}: {
  content: ContentSlot;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}) {
  const router = useRouter();
  const typeConfig = contentTypes.find(t => t.value === content.type);
  const TypeIcon = typeConfig?.icon || FileText;

  const handleGoToStoryboard = () => {
    // Format the date as YYYY-MM-DD for the URL parameter
    const dateString = format(new Date(content.startDate), 'yyyy-MM-dd');
    router.push(`/storyboard?date=${dateString}`);
  };

  return (
    <Card
      className={`bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all cursor-pointer group ${
        isDragging ? 'opacity-50 scale-105 shadow-2xl' : ''
      }`}
      onDoubleClick={onEdit}
    >
      <CardContent className='p-3'>
        <div className='flex items-start justify-between mb-2'>
          <div className='flex items-center gap-0.5'>
            <TypeIcon className='h-4 w-4 text-[#ff0a54]' />
            <Badge variant='secondary' className='text-xs'>
              {typeConfig?.label}
            </Badge>
          </div>

          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onDelete}
              className='h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-500'
            >
              <Trash2 className='h-3 w-3' />
            </Button>
          </div>
        </div>

        <div className='flex flex-col justify-center items-center text-center'>
          <h4 className='font-bold text-foreground text-sm mb-2 line-clamp-2'>
            {content.title}
          </h4>

          {content.description && (
            <p className='text-xs text-muted-foreground line-clamp-2 mb-2'>
              {content.description}
            </p>
          )}

          {/* Storyboard Button - Only for STORY type */}
          {content.type === 'STORY' && (
            <Button
              variant='outline'
              size='sm'
              onClick={e => {
                e.stopPropagation();
                handleGoToStoryboard();
              }}
              className='w-full text-xs bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700 hover:text-pink-800'
            >
              <ArrowRight className='h-3 w-3 mr-1' />
              استوری بورد
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Content Form Component
function ContentForm({
  onSubmit,
  onCancel,
  editingContent,
  weekDays,
  currentWeek,
  isLoading,
}: {
  onSubmit: (formData: CreateContentData) => void;
  onCancel: () => void;
  editingContent: ContentSlot | null;
  weekDays: Array<{
    dayOfWeek: number;
    persianName: string;
    jalaliDate: string;
  }>;
  currentWeek: Date;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateContentData>({
    title: editingContent?.title || '',
    type: editingContent?.type || 'STORY',
    dayOfWeek: editingContent ? new Date(editingContent.startDate).getDay() : 0,
    weekStart: format(currentWeek, 'yyyy-MM-dd'),
    notes: editingContent?.description || '',
  });

  useEffect(() => {
    if (editingContent) {
      setFormData({
        title: editingContent.title,
        type: editingContent.type,
        dayOfWeek: new Date(editingContent.startDate).getDay(),
        weekStart: format(currentWeek, 'yyyy-MM-dd'),
        notes: editingContent.description || '',
      });
    } else {
      // For new content, always use current week
      setFormData(prev => ({
        ...prev,
        weekStart: format(currentWeek, 'yyyy-MM-dd'),
      }));
    }
  }, [editingContent, currentWeek]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='title'>عنوان</Label>
        <Input
          id='title'
          value={formData.title}
          onChange={e =>
            setFormData(prev => ({ ...prev, title: e.target.value }))
          }
          placeholder='عنوان محتوا'
          required
        />
      </div>

      <div>
        <Label htmlFor='type'>نوع</Label>
        <Select
          value={formData.type}
          onValueChange={(value: 'STORY' | 'POST') =>
            setFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {contentTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor='dayOfWeek'>روز هفته</Label>
        <Select
          value={formData.dayOfWeek.toString()}
          onValueChange={value =>
            setFormData(prev => ({ ...prev, dayOfWeek: parseInt(value) }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {weekDays.map(day => (
              <SelectItem key={day.dayOfWeek} value={day.dayOfWeek.toString()}>
                {day.persianName} ({day.jalaliDate})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor='notes'>یادداشت‌ها</Label>
        <Textarea
          id='notes'
          value={formData.notes}
          onChange={e =>
            setFormData(prev => ({ ...prev, notes: e.target.value }))
          }
          placeholder='یادداشت‌های مربوط به محتوا'
          rows={3}
        />
      </div>

      <div className='flex justify-end gap-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          انصراف
        </Button>
        <Button
          type='submit'
          disabled={isLoading}
          className='bg-pink-100 text-pink-700 hover:bg-pink-200'
        >
          {isLoading
            ? 'در حال ذخیره...'
            : editingContent
              ? 'بروزرسانی'
              : 'ایجاد'}
        </Button>
      </div>
    </form>
  );
}
