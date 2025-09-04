'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  User,
  Flag,
  Tag,
  Clock,
  CheckSquare,
  AlertCircle,
  Edit3,
  Trash2,
  MessageSquare,
  Paperclip,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  comments?: Comment[];
  attachments?: Attachment[];
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

interface MobileTaskDetailProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  className?: string;
}

const statusConfig = {
  TODO: {
    label: 'در انتظار',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
    nextAction: 'شروع',
    nextStatus: 'IN_PROGRESS' as const,
  },
  IN_PROGRESS: {
    label: 'در حال انجام',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
    nextAction: 'تکمیل',
    nextStatus: 'COMPLETED' as const,
  },
  COMPLETED: {
    label: 'تکمیل شده',
    color: 'bg-green-100 text-green-800',
    icon: CheckSquare,
    nextAction: 'بازگشایی',
    nextStatus: 'TODO' as const,
  },
};

const priorityConfig = {
  HIGH: {
    label: 'بالا',
    color: 'bg-red-100 text-red-800',
    icon: Flag,
  },
  MEDIUM: {
    label: 'متوسط',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Flag,
  },
  LOW: {
    label: 'پایین',
    color: 'bg-green-100 text-green-800',
    icon: Flag,
  },
};

export function MobileTaskDetail({
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange: _onStatusChange,
  className: _className,
}: MobileTaskDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusInfo = statusConfig[task.status] || statusConfig.TODO;
  const priorityInfo = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const StatusIcon = statusInfo.icon;
  const PriorityIcon = priorityInfo.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleStatusChange = () => {
    _onStatusChange(task.id, statusInfo.nextStatus);
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-white ${_className || ''}`}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='h-8 w-8 p-0'
        >
          <ArrowRight className='h-5 w-5' />
        </Button>
        <h1 className='text-lg font-semibold text-gray-900'>جزئیات وظیفه</h1>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0'
          onClick={() => onEdit(task)}
        >
          <Edit3 className='h-5 w-5' />
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-y-auto h-[calc(100vh-80px)] p-4 space-y-6'>
        {/* Task Header */}
        <Card>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-xl font-bold text-gray-900 mb-2'>
                  {task.title}
                </CardTitle>
                <div className='flex items-center space-x-3 space-x-reverse mb-3'>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className='h-3 w-3 mr-1' />
                    {statusInfo.label}
                  </Badge>
                  <Badge className={priorityInfo.color}>
                    <PriorityIcon className='h-3 w-3 mr-1' />
                    {priorityInfo.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {task.description && (
              <div className='mb-4'>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>
                  توضیحات
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  {task.description}
                </p>
              </div>
            )}

            {/* Task Meta */}
            <div className='grid grid-cols-1 gap-4'>
              {task.assignee && (
                <div className='flex items-center'>
                  <User className='h-4 w-4 text-gray-400 mr-3' />
                  <div className='flex items-center'>
                    <Avatar className='h-6 w-6 mr-2'>
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback className='text-xs'>
                        {task.assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-sm text-gray-600'>
                      {task.assignee.name}
                    </span>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className='flex items-center'>
                  <Calendar className='h-4 w-4 text-gray-400 mr-3' />
                  <div>
                    <span className='text-sm text-gray-600'>تاریخ سررسید:</span>
                    <p className='text-sm font-medium text-gray-900'>
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                </div>
              )}

              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-gray-400 mr-3' />
                <div>
                  <span className='text-sm text-gray-600'>ایجاد شده:</span>
                  <p className='text-sm font-medium text-gray-900'>
                    {formatDate(task.createdAt)}
                  </p>
                </div>
              </div>

              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-gray-400 mr-3' />
                <div>
                  <span className='text-sm text-gray-600'>
                    آخرین بروزرسانی:
                  </span>
                  <p className='text-sm font-medium text-gray-900'>
                    {formatDate(task.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <Tag className='h-5 w-5 mr-2' />
                برچسب‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {task.tags.map(tag => (
                  <Badge key={tag} variant='outline' className='text-sm'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <Paperclip className='h-5 w-5 mr-2' />
                فایل‌های پیوست
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {task.attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'
                  >
                    <div className='flex items-center'>
                      <Paperclip className='h-4 w-4 text-gray-400 mr-3' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {attachment.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {formatFileSize(attachment.size)} • {attachment.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      دانلود
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        {task.comments && task.comments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <MessageSquare className='h-5 w-5 mr-2' />
                نظرات ({task.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {task.comments.map(comment => (
                  <div
                    key={comment.id}
                    className='flex space-x-3 space-x-reverse'
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback className='text-xs'>
                        {comment.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 space-x-reverse mb-1'>
                        <span className='text-sm font-medium text-gray-900'>
                          {comment.author.name}
                        </span>
                        <span className='text-xs text-gray-500'>
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600'>{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className='space-y-3 pb-6'>
          <Button
            onClick={handleStatusChange}
            className='w-full h-12 bg-blue-600 hover:bg-blue-700'
          >
            <StatusIcon className='h-4 w-4 mr-2' />
            {statusInfo.nextAction}
          </Button>

          <div className='grid grid-cols-2 gap-3'>
            <Button
              variant='outline'
              onClick={() => onEdit(task)}
              className='h-12'
            >
              <Edit3 className='h-4 w-4 mr-2' />
              ویرایش
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowDeleteConfirm(true)}
              className='h-12 text-red-600 border-red-200 hover:bg-red-50'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              حذف
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4'
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-2xl p-6 max-w-sm w-full'
            >
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                حذف وظیفه
              </h3>
              <p className='text-gray-600 mb-6'>
                آیا مطمئن هستید که می‌خواهید این وظیفه را حذف کنید؟ این عمل قابل
                بازگشت نیست.
              </p>
              <div className='flex space-x-3 space-x-reverse'>
                <Button
                  variant='outline'
                  onClick={() => setShowDeleteConfirm(false)}
                  className='flex-1'
                >
                  انصراف
                </Button>
                <Button
                  onClick={handleDelete}
                  className='flex-1 bg-red-600 hover:bg-red-700'
                >
                  حذف
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
