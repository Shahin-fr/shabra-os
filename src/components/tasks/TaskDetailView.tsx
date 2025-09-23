'use client';

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Paperclip,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCardProps } from '@/components/ui/TaskCard';

// Placeholder Avatar Component (reused from TaskCard)
const Avatar: React.FC<{ 
  src?: string; 
  alt: string; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ src, alt, size = 'sm', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-semibold ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="text-xs font-bold">
          {alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export interface TaskDetailViewProps {
  task: TaskCardProps;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task }) => {
  const {
    title,
    description,
    priority,
    dueDate,
    tags = [],
    assignees = [],
    isCompleted = false
  } = task;

  // Priority configuration (same as TaskCard)
  const priorityConfig = {
    high: {
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      label: 'بالا',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    medium: {
      icon: <Clock className="w-5 h-5 text-yellow-500" />,
      label: 'متوسط',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    low: {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      label: 'پایین',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  };

  const config = priorityConfig[priority];

  return (
    <div className="space-y-6 text-right">
      {/* Task Header */}
      <div className="space-y-4">
        {/* Title and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {config.icon}
            <h2 className={`text-2xl font-bold text-gray-800 ${
              isCompleted ? 'line-through opacity-60' : ''
            }`}>
              {title}
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">تکمیل شده</span>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Task Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority */}
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
            {config.icon}
            <div>
              <p className="text-sm text-gray-600">اولویت</p>
              <p className={`font-medium ${config.color}`}>{config.label}</p>
            </div>
          </div>

          {/* Due Date */}
          {dueDate && (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 border-blue-200">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">تاریخ موعد</p>
                <p className="font-medium text-blue-600">{dueDate}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">برچسب‌ها</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full font-medium border border-pink-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Assignees */}
        {assignees.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">مسئولان</span>
            </div>
            <div className="flex items-center gap-2">
              {assignees.map((assignee, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Avatar
                    src={assignee.src}
                    alt={assignee.alt}
                    size="md"
                    className="border-2 border-white shadow-sm"
                  />
                  <span className="text-sm text-gray-700">{assignee.alt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">نظرات</h3>
          </div>
          <Button size="sm" variant="outline" className="text-xs">
            <Plus className="w-4 h-4 ml-1" />
            نظر جدید
          </Button>
        </div>

        {/* Placeholder Comments */}
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Avatar alt="علی احمدی" size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">علی احمدی</span>
                  <span className="text-xs text-gray-500">۲ ساعت پیش</span>
                </div>
                <p className="text-sm text-gray-700">
                  این کار رو باید تا پایان هفته تکمیل کنیم. آیا نیاز به کمک دارید؟
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Avatar alt="سارا محمدی" size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">سارا محمدی</span>
                  <span className="text-xs text-gray-500">۱ روز پیش</span>
                </div>
                <p className="text-sm text-gray-700">
                  من روی بخش طراحی کار می‌کنم. تا فردا آماده می‌شه.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">پیوست‌ها</h3>
        </div>

        {/* Placeholder Attachments */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">طراحی اولیه.pdf</p>
                <p className="text-xs text-gray-500">۲.۴ مگابایت</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-xs">
              دانلود
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">مستندات فنی.docx</p>
                <p className="text-xs text-gray-500">۱.۸ مگابایت</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-xs">
              دانلود
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="outline" size="sm">
          ویرایش
        </Button>
        <Button variant="default" size="sm">
          {isCompleted ? 'بازگشت به کار' : 'تکمیل کار'}
        </Button>
      </div>
    </div>
  );
};

export default TaskDetailView;
