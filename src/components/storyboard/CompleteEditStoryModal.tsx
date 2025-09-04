'use client';

import { motion } from 'framer-motion';
import { Edit3, Lightbulb, X, Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DynamicLucideIcon } from '@/components/ui/DynamicLucideIcon';
import { cn } from '@/lib/utils';

interface StoryIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
}

interface Story {
  id: string;
  title: string;
  notes?: string;
  link?: string;
  customTitle?: string;
  type?: string;
  ideaId?: string;
  storyIdea?: StoryIdea;
}

interface CompleteEditStoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (storyData: {
    title: string;
    notes?: string;
    link?: string;
    customTitle?: string;
    ideaId?: string;
  }) => void;
  onDelete?: (storyId: string) => void;
  onOpenIdeaBank: () => void;
  story?: Story | null;
  isLoading?: boolean;
}

export function CompleteEditStoryModal({
  isOpen,
  onOpenChange,
  onSubmit,
  onDelete,
  onOpenIdeaBank,
  story,
  isLoading = false,
}: CompleteEditStoryModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    link: '',
    customTitle: '',
  });

  const [selectedIdea, setSelectedIdea] = useState<StoryIdea | null>(null);

  // Initialize form data when story changes
  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title || '',
        notes: story.notes || '',
        link: story.link || '',
        customTitle: story.customTitle || '',
      });
      setSelectedIdea(story.storyIdea || null);
    } else {
      setFormData({
        title: '',
        notes: '',
        link: '',
        customTitle: '',
      });
      setSelectedIdea(null);
    }
  }, [story]);

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    onSubmit({
      title: formData.title,
      notes: formData.notes || undefined,
      link: formData.link || undefined,
      customTitle: formData.customTitle || undefined,
      ideaId: selectedIdea?.id || undefined,
    });
  };

  const handleDelete = () => {
    if (story?.id && onDelete) {
      onDelete(story.id);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleIdeaSelect = (idea: StoryIdea) => {
    setSelectedIdea(idea);
    // Update custom title with template if it's empty
    if (!formData.customTitle && idea.template) {
      setFormData(prev => ({
        ...prev,
        customTitle: idea.template,
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className='sm:max-w-2xl max-h-[90vh] border-0 p-0 overflow-hidden bg-white'
        style={{
          boxShadow: `
            0 25px 80px rgba(0, 0, 0, 0.15),
            0 15px 40px rgba(0, 0, 0, 0.1)
          `,
        }}
        hideCloseButton
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
                <Edit3 className='h-4 w-4 text-[#ff0a54]' />
              </div>
              <div>
                <DialogTitle className='text-xl font-bold text-gray-900'>
                  تکمیل و ویرایش استوری
                </DialogTitle>
                <p className='text-sm text-gray-600'>
                  {story ? 'ویرایش استوری موجود' : 'تکمیل اطلاعات استوری'}
                </p>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClose}
              className='p-2 hover:bg-gray-100'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-6'>
              {/* Story Type Display */}
              {story?.type && (
                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='text-sm font-medium text-gray-700'>
                      نوع استوری:
                    </span>
                    <Badge className='bg-[#ff0a54]/10 text-[#ff0a54] border-[#ff0a54]/20'>
                      {story.type}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Idea Bank Button */}
              <div className='space-y-3'>
                <Button
                  onClick={onOpenIdeaBank}
                  className='w-full bg-gradient-to-r from-[#ff0a54] to-[#ff0a54]/80 hover:from-[#ff0a54]/90 hover:to-[#ff0a54]/70 text-white'
                >
                  <Lightbulb className='h-4 w-4 ml-2' />
                  مشاهده ایده‌های مرتبط 💡
                </Button>

                {selectedIdea && (
                  <Card className='border-[#ff0a54]/20 bg-[#ff0a54]/5'>
                    <CardContent className='p-4'>
                      <div className='flex items-start gap-3'>
                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center flex-shrink-0'>
                          <DynamicLucideIcon
                            iconName={selectedIdea.icon}
                            className='h-5 w-5 text-[#ff0a54]'
                            fallbackIcon={Lightbulb}
                          />
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-semibold text-gray-900 mb-1'>
                            {selectedIdea.title}
                          </h4>
                          <p className='text-sm text-gray-600 mb-2'>
                            {selectedIdea.description}
                          </p>
                          <div className='text-xs text-[#ff0a54] font-medium'>
                            راهنما: {selectedIdea.guidelines}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Custom Title Field */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>
                  عنوان اختصاصی
                </label>
                <Input
                  placeholder='عنوان خاص این استوری را وارد کنید...'
                  value={formData.customTitle}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      customTitle: e.target.value,
                    }))
                  }
                  className='bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50'
                />
                <p className='text-xs text-gray-500'>
                  این عنوان برای این روز خاص استفاده می‌شود
                </p>
              </div>

              {/* Notes Field */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>
                  یادداشت‌ها
                </label>
                <Textarea
                  placeholder='یادداشت‌ها و نکات مهم...'
                  value={formData.notes}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, notes: e.target.value }))
                  }
                  className='bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50 min-h-[100px]'
                />
              </div>

              {/* Link Field */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>
                  لینک
                </label>
                <Input
                  placeholder='لینک مرتبط (اختیاری)...'
                  value={formData.link}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, link: e.target.value }))
                  }
                  className='bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50'
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='p-6 border-t border-gray-100'>
            <div className='flex items-center justify-between gap-3'>
              {story && onDelete && (
                <Button
                  variant='outline'
                  onClick={handleDelete}
                  className='text-red-600 border-red-200 hover:bg-red-50'
                >
                  <Trash2 className='h-4 w-4 ml-2' />
                  حذف استوری
                </Button>
              )}
              <div className='flex gap-3 flex-1 justify-end'>
                <Button
                  variant='outline'
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  انصراف
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.title.trim()}
                  className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
                >
                  <Save className='h-4 w-4 ml-2' />
                  {isLoading ? 'در حال ذخیره...' : 'ذخیره استوری'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
