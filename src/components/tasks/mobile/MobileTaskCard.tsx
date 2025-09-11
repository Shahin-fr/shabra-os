'use client';

import { motion } from 'framer-motion';
import { Clock, MoreHorizontal, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  assignee: string;
  progress: number;
  tags: string[];
}

interface MobileTaskCardProps {
  task: Task;
  onClick?: () => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'تکمیل شده';
    case 'in_progress':
      return 'در حال انجام';
    case 'pending':
      return 'در انتظار';
    default:
      return 'نامشخص';
  }
};

export function MobileTaskCard({ task, onClick }: MobileTaskCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`mobile-card transition-all duration-200 ${
        task.status === 'completed' ? 'opacity-75' : ''
      }`}>
        <CardContent className="mobile-padding">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                {task.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2">
                {task.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 w-8 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                // Handle menu
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border-gray-200"
                >
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border-gray-200"
                >
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Progress Bar (only for in_progress tasks) */}
          {task.status === 'in_progress' && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>پیشرفت</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Priority Badge */}
              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? 'بالا' : task.priority === 'medium' ? 'متوسط' : 'پایین'}
              </Badge>
              
              {/* Status Badge */}
              <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                {getStatusText(task.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span className="truncate max-w-20">{task.assignee}</span>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{task.dueDate}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
