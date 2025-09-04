'use client';

import { motion } from 'framer-motion';
import { Lightbulb, ArrowLeft, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { DynamicLucideIcon } from '@/components/ui/DynamicLucideIcon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface StoryIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive: boolean;
}

interface StoryType {
  id: string;
  name: string;
  icon?: string;
}

interface IntelligentStoryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (storyData: {
    title: string;
    notes?: string;
    link?: string;
    storyTypeId?: string;
    storyIdeaId?: string;
  }) => void;
  storyTypes: StoryType[];
  selectedIdea?: StoryIdea | null;
  isLoading?: boolean;
  editingStory?: any;
  isEditing?: boolean;
}

const categoryColors = {
  تعامل: 'bg-blue-100 text-blue-800 border-blue-200',
  فروش: 'bg-green-100 text-green-800 border-green-200',
  'ساخت برند': 'bg-purple-100 text-purple-800 border-purple-200',
  آموزش: 'bg-orange-100 text-orange-800 border-orange-200',
  سرگرمی: 'bg-pink-100 text-pink-800 border-pink-200',
  'پشت صحنه': 'bg-gray-100 text-gray-800 border-gray-200',
};

export function IntelligentStoryForm({
  isOpen,
  onOpenChange,
  onSubmit,
  storyTypes,
  selectedIdea,
  isLoading = false,
  editingStory = null,
  isEditing = false,
}: IntelligentStoryFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    link: '',
    storyTypeId: '',
  });

  // Update form data when editing story changes
  useEffect(() => {
    if (editingStory && isEditing) {
      setFormData({
        title: editingStory.title || '',
        notes: editingStory.notes || '',
        link: editingStory.link || '',
        storyTypeId: editingStory.storyType?.id || '',
      });
    } else if (selectedIdea && !isEditing) {
      // Pre-populate with idea template
      setFormData({
        title: selectedIdea.template,
        notes: '',
        link: '',
        storyTypeId: '',
      });
    } else {
      setFormData({
        title: '',
        notes: '',
        link: '',
        storyTypeId: '',
      });
    }
  }, [editingStory, isEditing, selectedIdea]);

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    onSubmit({
      title: formData.title,
      notes: formData.notes || undefined,
      link: formData.link || undefined,
      storyTypeId: formData.storyTypeId || undefined,
      storyIdeaId: selectedIdea?.id || undefined,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-[600px] max-h-[90vh] border-0 p-0 overflow-hidden bg-white'
        style={{
          boxShadow: `
            0 25px 80px rgba(0, 0, 0, 0.15),
            0 15px 40px rgba(0, 0, 0, 0.1)
          `,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className='h-full flex flex-col'
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-100'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center'>
                <Sparkles className='h-4 w-4 text-[#ff0a54]' />
              </div>
              <DialogTitle className='text-xl font-bold text-gray-900'>
                {isEditing ? 'ویرایش استوری' : 'ایجاد استوری جدید'}
              </DialogTitle>
            </div>
            <DialogClose asChild>
              <Button
                variant='ghost'
                size='sm'
                className='p-2 hover:bg-gray-100'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
            </DialogClose>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-6'>
            <motion.div
              className='space-y-6'
              initial='hidden'
              animate='visible'
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.1,
                  },
                },
              }}
            >
              {/* Selected Idea Info (only when creating new story) */}
              {selectedIdea && !isEditing && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
                    <CardContent className='p-4'>
                      <div className='flex items-start gap-3'>
                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center flex-shrink-0'>
                          <DynamicLucideIcon
                            iconName={selectedIdea.icon}
                            className='h-5 w-5 text-[#ff0a54]'
                            fallbackIcon={Sparkles}
                          />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <h3 className='font-semibold text-gray-900'>
                              {selectedIdea.title}
                            </h3>
                            <Badge
                              className={cn(
                                'text-xs px-2 py-1',
                                categoryColors[
                                  selectedIdea.category as keyof typeof categoryColors
                                ] || 'bg-gray-100 text-gray-800'
                              )}
                            >
                              {selectedIdea.category}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-700 mb-3'>
                            {selectedIdea.description}
                          </p>
                          <div className='flex items-start gap-2'>
                            <Lightbulb className='h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0' />
                            <div className='text-xs text-gray-600'>
                              <strong>راهنمای استفاده:</strong>
                              <div className='mt-1 whitespace-pre-wrap'>
                                {selectedIdea.guidelines}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Editing Story Info (only when editing) */}
              {editingStory && isEditing && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className='bg-gray-50 border-gray-200'>
                    <CardContent className='p-4'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h3 className='font-semibold text-gray-900'>
                          نوع ایده:{' '}
                          {editingStory.storyIdea?.title || 'ایده سفارشی'}
                        </h3>
                        {editingStory.storyIdea?.category && (
                          <Badge
                            className={cn(
                              'text-xs px-2 py-1',
                              categoryColors[
                                editingStory.storyIdea
                                  .category as keyof typeof categoryColors
                              ] || 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {editingStory.storyIdea.category}
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm text-gray-600'>
                        این فیلد فقط برای نمایش است و قابل تغییر نیست
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Title Field */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
              >
                <Label
                  htmlFor='title'
                  className='text-sm font-semibold text-gray-700'
                >
                  عنوان استوری *
                </Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder='عنوان استوری را وارد کنید'
                  className='mt-2 bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50'
                />
                {selectedIdea && !isEditing && (
                  <p className='text-xs text-gray-500 mt-1'>
                    💡 قالب پیشنهادی: {selectedIdea.template}
                  </p>
                )}
              </motion.div>

              {/* Story Type Field */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
              >
                <Label
                  htmlFor='storyType'
                  className='text-sm font-semibold text-gray-700'
                >
                  نوع استوری
                </Label>
                <select
                  id='storyType'
                  value={formData.storyTypeId}
                  onChange={e =>
                    setFormData({ ...formData, storyTypeId: e.target.value })
                  }
                  className='mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:border-[#ff0a54]/50 focus:outline-none focus:ring-1 focus:ring-[#ff0a54]/20'
                >
                  <option value=''>نوع استوری را انتخاب کنید</option>
                  {storyTypes.map(storyType => (
                    <option key={storyType.id} value={storyType.id}>
                      {storyType.name}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Notes Field */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
              >
                <Label
                  htmlFor='notes'
                  className='text-sm font-semibold text-gray-700'
                >
                  یادداشت‌ها
                </Label>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder='یادداشت‌های مربوط به استوری'
                  className='mt-2 bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50'
                  rows={3}
                />
              </motion.div>

              {/* Link Field */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
              >
                <Label
                  htmlFor='link'
                  className='text-sm font-semibold text-gray-700'
                >
                  لینک
                </Label>
                <Input
                  id='link'
                  value={formData.link}
                  onChange={e =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder='لینک مرتبط با استوری'
                  className='mt-2 bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50'
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className='p-6 border-t border-gray-100'>
            <motion.div
              className='flex items-center justify-end gap-3'
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button
                variant='outline'
                onClick={handleClose}
                className='border-gray-300 hover:border-[#ff0a54]/50 bg-white hover:bg-gray-50'
              >
                انصراف
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !formData.title.trim()}
                className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white shadow-lg hover:shadow-xl'
              >
                {isLoading
                  ? 'در حال ذخیره...'
                  : isEditing
                    ? 'بروزرسانی'
                    : 'ایجاد'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
