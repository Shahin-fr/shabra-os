'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MobileFormModal,
  MobileFormField,
  MobileInput,
  MobileTextarea,
  MobileSelect,
  SelectItem,
} from '@/components/forms';
import { SkeletonListStaggered } from '@/components/ui/skeleton-loaders';
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

interface MobileContentCalendarProps {
  className?: string;
}

export function MobileContentCalendar({
  className: _className,
}: MobileContentCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 6 }); // Saturday
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentSlot | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

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

        if (result.success && result.data) {
          return result.data;
        }

        throw new Error('Invalid response structure from content slots API');
      } catch (error) {
        logger.error('Failed to fetch content slots:', error as Error);
        return [];
      }
    },
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
  });

  // Create content mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateContentData) => {
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

      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Invalid response structure from content creation API');
    },
    onMutate: async () => {
      showStatusMessage('در حال ایجاد محتوا...', 2000);
      await queryClient.cancelQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setEditingContent(null);
      setIsEditing(false);
      showStatusMessage('محتوای جدید با موفقیت ایجاد شد', 3000);
      queryClient.invalidateQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
    },
    onError: error => {
      showStatusMessage(`خطا در ایجاد محتوا: ${error.message}`, 3000);
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

      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Invalid response structure from content deletion API');
    },
    onMutate: async () => {
      showStatusMessage('در حال حذف محتوا...', 2000);
    },
    onSuccess: () => {
      showStatusMessage('محتوایی با موفقیت حذف شد', 3000);
      queryClient.invalidateQueries({
        queryKey: contentSlotsKeys.all,
        exact: false,
      });
    },
    onError: error => {
      showStatusMessage(`خطا در حذف محتوا: ${error.message}`, 3000);
    },
  });

  const handleCreateContent = (data: CreateContentData) => {
    createMutation.mutate(data);
  };

  const handleDeleteContent = (id: string) => {
    // In a real app, this would show a confirmation dialog
    deleteMutation.mutate(id);
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

  return (
    <div className={_className}>
      {/* Header */}
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
              <h1 className='text-2xl font-bold text-foreground mb-2'>
                تقویم محتوا
              </h1>
              <p className='text-muted-foreground'>
                برنامه‌ریزی هفتگی محتوا و استوری‌ها
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <Button
                onClick={goToCurrentWeek}
                variant='outline'
                size='sm'
                className='bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200'
              >
                <Calendar className='h-4 w-4 ml-1' />
                هفته جاری
              </Button>

              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className='bg-pink-500 hover:bg-pink-600 text-white'
              >
                <Plus className='h-4 w-4 ml-1' />
                محتوای جدید
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Navigation */}
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
              className='hover:bg-pink-100'
            >
              <ChevronRight className='h-4 w-4 ml-1' />
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
              className='hover:bg-pink-100'
            >
              هفته بعد
              <ChevronLeft className='h-4 w-4 mr-1' />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Content List */}
      <div className='space-y-4'>
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
            <motion.div
              key={day.dayOfWeek}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className='bg-white/20 backdrop-blur-sm border-white/30'>
                <CardContent className='p-4'>
                  {/* Day Header */}
                  <div className='flex items-center justify-between mb-4'>
                    <div>
                      <h3 className='text-lg font-semibold text-foreground'>
                        {day.persianName}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {day.jalaliDate} / {day.gregorianDate}
                      </p>
                    </div>
                    <Badge variant='outline' className='bg-white/20'>
                      {dayContent.length} محتوا
                    </Badge>
                  </div>

                  {/* Content List */}
                  <div className='space-y-3'>
                    {isLoadingSlots ? (
                      <SkeletonListStaggered count={3} />
                    ) : slotsError ? (
                      <div className='text-center py-4'>
                        <p className='text-sm text-red-500'>
                          خطا در بارگذاری محتوا
                        </p>
                      </div>
                    ) : dayContent.length > 0 ? (
                      <AnimatePresence>
                        {dayContent.map((content: ContentSlot) => (
                          <motion.div
                            key={content.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ContentCard
                              content={content}
                              onEdit={() => {
                                setEditingContent(content);
                                setIsEditing(true);
                                setIsCreateDialogOpen(true);
                              }}
                              onDelete={() => handleDeleteContent(content.id)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <div className='text-center py-8'>
                        <FileText className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                        <p className='text-sm text-muted-foreground'>
                          محتوایی برای این روز وجود ندارد
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create/Edit Content Modal */}
      <MobileFormModal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title={isEditing ? 'ویرایش محتوا' : 'محتوای جدید'}
        onSubmit={() => {
          // This will be handled by the form inside
        }}
        submitLabel={isEditing ? 'بروزرسانی' : 'ایجاد'}
        isLoading={createMutation.isPending}
      >
        <ContentForm
          onSubmit={handleCreateContent}
          editingContent={editingContent}
          weekDays={weekDays}
          currentWeek={currentWeek}
          isLoading={createMutation.isPending}
        />
      </MobileFormModal>
    </div>
  );
}

// Content Card Component
function ContentCard({
  content,
  onEdit,
  onDelete,
}: {
  content: ContentSlot;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeConfig = contentTypes.find(t => t.value === content.type);
  const TypeIcon = typeConfig?.icon || FileText;

  return (
    <Card className='bg-white/30 backdrop-blur-sm border-white/40 hover:bg-white/40 transition-all'>
      <CardContent className='p-3'>
        <div className='flex items-start justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <TypeIcon className='h-4 w-4 text-pink-500' />
            <Badge variant='secondary' className='text-xs'>
              {typeConfig?.label}
            </Badge>
          </div>

          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onEdit}
              className='h-6 w-6 p-0 hover:bg-pink-100'
            >
              <FileText className='h-3 w-3' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={onDelete}
              className='h-6 w-6 p-0 hover:bg-red-100 hover:text-red-500'
            >
              <Trash2 className='h-3 w-3' />
            </Button>
          </div>
        </div>

        <div className='text-center'>
          <h4 className='font-semibold text-foreground text-sm mb-1 line-clamp-2'>
            {content.title}
          </h4>

          {content.description && (
            <p className='text-xs text-muted-foreground line-clamp-2'>
              {content.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Content Form Component
function ContentForm({
  onSubmit,
  editingContent,
  weekDays,
  currentWeek,
  isLoading: _isLoading,
}: {
  onSubmit: (formData: CreateContentData) => void;
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
      setFormData(prev => ({
        ...prev,
        weekStart: format(currentWeek, 'yyyy-MM-dd'),
      }));
    }
  }, [editingContent, currentWeek]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <MobileFormField label='عنوان' required>
        <MobileInput
          value={formData.title}
          onChange={e =>
            setFormData(prev => ({ ...prev, title: e.target.value }))
          }
          placeholder='عنوان محتوا'
          required
        />
      </MobileFormField>

      <MobileFormField label='نوع'>
        <MobileSelect
          value={formData.type}
          onValueChange={(value: string) =>
            setFormData(prev => ({ ...prev, type: value as 'STORY' | 'POST' }))
          }
          placeholder='نوع محتوا را انتخاب کنید'
        >
          {contentTypes.map(type => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </MobileSelect>
      </MobileFormField>

      <MobileFormField label='روز هفته'>
        <MobileSelect
          value={formData.dayOfWeek.toString()}
          onValueChange={value =>
            setFormData(prev => ({ ...prev, dayOfWeek: parseInt(value) }))
          }
          placeholder='روز هفته را انتخاب کنید'
        >
          {weekDays.map(day => (
            <SelectItem key={day.dayOfWeek} value={day.dayOfWeek.toString()}>
              {day.persianName} ({day.jalaliDate})
            </SelectItem>
          ))}
        </MobileSelect>
      </MobileFormField>

      <MobileFormField label='یادداشت‌ها'>
        <MobileTextarea
          value={formData.notes}
          onChange={e =>
            setFormData(prev => ({ ...prev, notes: e.target.value }))
          }
          placeholder='یادداشت‌های مربوط به محتوا'
        />
      </MobileFormField>
    </form>
  );
}
