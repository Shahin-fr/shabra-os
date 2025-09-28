'use client';

import { AnimatePresence } from 'framer-motion';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { X, Calendar, User, Flag, Tag, Save, Clock } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface TaskFormData {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assigneeId?: string;
  dueDate?: string;
  tags: string[];
}

interface UserType {
  id: string;
  name: string;
  avatar?: string;
}

interface MobileTaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  users?: UserType[];
  className?: string;
}

const priorityOptions = [
  { value: 'HIGH', label: 'بالا', color: 'bg-red-100 text-red-800' },
  { value: 'MEDIUM', label: 'متوسط', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'LOW', label: 'پایین', color: 'bg-green-100 text-green-800' },
];

const commonTags = [
  'فوری',
  'مهم',
  'بازاریابی',
  'توسعه',
  'طراحی',
  'تست',
  'مستندات',
  'بازبینی',
];

export function MobileTaskCreationModal({
  isOpen,
  onClose,
  onSubmit,
  users = [],
  className: _className,
}: MobileTaskCreationModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: '',
    tags: [],
  });
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()],
      }));
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assigneeId: '',
        dueDate: '',
        tags: [],
      });
      onClose();
    } catch (_error) {
      // Handle error silently or show user-friendly message
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    return formatDateForInput(new Date());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 z-40'
            onClick={onClose}
          />

          {/* Bottom Sheet Modal */}
          <OptimizedMotion
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed bottom-0 start-0 end-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden ${_className || ''}`}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>
                ایجاد وظیفه جدید
              </h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={onClose}
                className='h-8 w-8 p-0'
              >
                <X className='h-5 w-5' />
              </Button>
            </div>

            {/* Content */}
            <div className='overflow-y-auto max-h-[calc(90vh-80px)]'>
              <form onSubmit={handleSubmit} className='p-4 space-y-6'>
                {/* Title */}
                <div className='space-y-2'>
                  <Label
                    htmlFor='title'
                    className='text-sm font-medium text-gray-700'
                  >
                    عنوان وظیفه *
                  </Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    placeholder='عنوان وظیفه را وارد کنید...'
                    className='h-12 text-base'
                    required
                  />
                </div>

                {/* Description */}
                <div className='space-y-2'>
                  <Label
                    htmlFor='description'
                    className='text-sm font-medium text-gray-700'
                  >
                    توضیحات
                  </Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder='توضیحات وظیفه را وارد کنید...'
                    rows={4}
                    className='resize-none'
                  />
                </div>

                {/* Priority and Assignee Row */}
                <div className='grid grid-cols-2 gap-4'>
                  {/* Priority */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-gray-700'>
                      اولویت
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'HIGH' | 'MEDIUM' | 'LOW') =>
                        handleInputChange('priority', value)
                      }
                    >
                      <SelectTrigger className='h-12'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className='flex items-center'>
                              <Flag className='h-4 w-4 me-2' />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assignee */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-gray-700'>
                      واگذار به
                    </Label>
                    <Select
                      value={formData.assigneeId || ''}
                      onValueChange={value =>
                        handleInputChange('assigneeId', value)
                      }
                    >
                      <SelectTrigger className='h-12'>
                        <SelectValue placeholder='انتخاب کنید...' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=''>بدون واگذاری</SelectItem>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className='flex items-center'>
                              <User className='h-4 w-4 me-2' />
                              {user.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Due Date */}
                <div className='space-y-2'>
                  <Label
                    htmlFor='dueDate'
                    className='text-sm font-medium text-gray-700'
                  >
                    تاریخ سررسید
                  </Label>
                  <div className='relative'>
                    <Input
                      id='dueDate'
                      type='date'
                      value={formData.dueDate}
                      onChange={e =>
                        handleInputChange('dueDate', e.target.value)
                      }
                      min={getMinDate()}
                      className='h-12 ps-10'
                    />
                    <Calendar className='absolute start-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                  </div>
                </div>

                {/* Tags */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium text-gray-700'>
                    برچسب‌ها
                  </Label>

                  {/* Selected Tags */}
                  {formData.tags.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {formData.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant='secondary'
                          className='flex items-center gap-1 pe-2'
                        >
                          <Tag className='h-3 w-3' />
                          {tag}
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-4 w-4 p-0 hover:bg-transparent'
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Common Tags */}
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      برچسب‌های پیشنهادی:
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {commonTags.map(tag => (
                        <Button
                          key={tag}
                          type='button'
                          variant={
                            formData.tags.includes(tag) ? 'default' : 'outline'
                          }
                          size='sm'
                          onClick={() => handleTagToggle(tag)}
                          className='h-8'
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Tag Input */}
                  <div className='flex gap-2'>
                    <Input
                      value={customTag}
                      onChange={e => setCustomTag(e.target.value)}
                      placeholder='برچسب سفارشی...'
                      className='flex-1'
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleAddCustomTag}
                      disabled={!customTag.trim()}
                    >
                      افزودن
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex space-x-3 rtl:space-x-reverse space-x-reverse pt-4 border-t border-gray-200'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={onClose}
                    className='flex-1 h-12'
                    disabled={isSubmitting}
                  >
                    انصراف
                  </Button>
                  <Button
                    type='submit'
                    className='flex-1 h-12 bg-blue-600 hover:bg-blue-700'
                    disabled={!formData.title.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className='flex items-center'>
                        <Clock className='h-4 w-4 me-2 animate-spin' />
                        در حال ایجاد...
                      </div>
                    ) : (
                      <div className='flex items-center'>
                        <Save className='h-4 w-4 me-2' />
                        ایجاد وظیفه
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </OptimizedMotion>
        </>
      )}
    </AnimatePresence>
  );
}

