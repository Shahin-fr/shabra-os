'use client';

import { Edit, Trash2, Eye, Calendar, Tag } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatJalaliDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { Story } from '@/types/story';

interface StoryCardProps {
  story: Story;
  isDragging?: boolean;
  onSelect?: (story: Story) => void;
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
  dragHandle?: React.ReactNode;
  className?: string;
}

export function StoryCard({
  story,
  isDragging = false,
  onSelect,
  onEdit,
  onDelete,
  dragHandle,
  className = '',
}: StoryCardProps) {
  const handleSelect = () => {
    onSelect?.(story);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(story);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('آیا از حذف این داستان اطمینان دارید؟')) {
      onDelete?.(story.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card
      className={cn(
        'relative transition-all duration-200 hover:shadow-md cursor-pointer group',
        isDragging && 'shadow-lg scale-105 rotate-2',
        className
      )}
      onClick={handleSelect}
    >
      {dragHandle && (
        <div className='absolute left-2 top-1/2 -translate-y-1/2 z-10'>
          {dragHandle}
        </div>
      )}

      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle className='text-lg font-semibold text-gray-900 line-clamp-2 leading-tight'>
            {story.title}
          </CardTitle>

          <div className='flex items-center gap-1 flex-shrink-0'>
            <Badge
              variant='outline'
              className={cn(
                'text-xs font-medium',
                getStatusColor(story.status)
              )}
            >
              {story.status === 'DRAFT' && 'پیش‌نویس'}
              {story.status === 'READY' && 'آماده'}
              {story.status === 'PUBLISHED' && 'منتشر شده'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {story.notes && (
          <p className='text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed'>
            {story.notes}
          </p>
        )}

        <div className='space-y-3'>
          {/* Story Type */}
          {story.storyType && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Tag className='w-4 h-4' />
              <span>{story.storyType.name}</span>
            </div>
          )}

          {/* Project */}
          {story.project && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Tag className='w-4 h-4' />
              <span>{story.project.name}</span>
            </div>
          )}

          {/* Day */}
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <Calendar className='w-4 h-4' />
            <span>روز: {formatJalaliDate(new Date(story.day))}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleSelect}
            className='h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          >
            <Eye className='w-4 h-4 mr-1' />
            مشاهده
          </Button>

          <Button
            variant='ghost'
            size='sm'
            onClick={handleEdit}
            className='h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
          >
            <Edit className='w-4 h-4 mr-1' />
            ویرایش
          </Button>

          <Button
            variant='ghost'
            size='sm'
            onClick={handleDelete}
            className='h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50'
          >
            <Trash2 className='w-4 h-4 mr-1' />
            حذف
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
