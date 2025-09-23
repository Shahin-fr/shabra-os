'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle
} from 'lucide-react';

// Placeholder Avatar Component (inline for now)
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

export interface TaskCardProps {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  tags?: string[];
  assignees?: Array<{ src?: string; alt: string; }>;
  isCompleted?: boolean;
  onClick?: () => void;
  className?: string;
}

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  ({ 
    title, 
    description, 
    priority, 
    dueDate, 
    tags = [], 
    assignees = [], 
    isCompleted = false, 
    onClick,
    className = '' 
  }, ref) => {
    // Priority color configurations based on Shabra UI Design System
    const priorityConfig = {
      high: {
        border: 'border-red-200',
        background: 'bg-red-50',
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        iconColor: 'text-red-500'
      },
      medium: {
        border: 'border-yellow-200',
        background: 'bg-yellow-50',
        icon: <Clock className="w-4 h-4 text-yellow-500" />,
        iconColor: 'text-yellow-500'
      },
      low: {
        border: 'border-green-200',
        background: 'bg-green-50',
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        iconColor: 'text-green-500'
      }
    };

    const config = priorityConfig[priority];

    // Card content component
    const CardContent = () => (
      <>
        {/* Header with priority icon and title */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {config.icon}
            <h3 className={`font-semibold text-gray-800 text-sm truncate ${
              isCompleted ? 'line-through' : ''
            }`}>
              {title}
            </h3>
          </div>
          {isCompleted && (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer with due date, assignees, and action button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Due date */}
            {dueDate && (
              <span className="text-xs text-gray-500 truncate">
                {dueDate}
              </span>
            )}
            
            {/* Assignees avatars */}
            {assignees.length > 0 && (
              <div className="flex items-center -space-x-1">
                {assignees.slice(0, 3).map((assignee, index) => (
                  <Avatar
                    key={index}
                    src={assignee.src}
                    alt={assignee.alt}
                    size="sm"
                    className="border-2 border-white shadow-sm"
                  />
                ))}
                {assignees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">
                      +{assignees.length - 3}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action button */}
          <Button 
            size="sm" 
            variant={isCompleted ? "ghost" : "default"}
            className="text-xs px-3 py-1 h-7 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle button click if needed
            }}
          >
            {isCompleted ? 'تکمیل شده' : 'مشاهده'}
          </Button>
        </div>
      </>
    );

    // If onClick is provided, render as button
    if (onClick) {
      return (
        <button
          ref={ref}
          onClick={onClick}
          className={`
            w-full p-4 rounded-xl border-2 ${config.border} ${config.background} 
            ${isCompleted ? 'opacity-60' : ''} 
            transition-all duration-200 hover:scale-[1.02] hover:shadow-md 
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
            text-right ${className}
          `}
          role="button"
          aria-label={`کار: ${title}${isCompleted ? ' (تکمیل شده)' : ''}`}
          disabled={isCompleted}
        >
          <CardContent />
        </button>
      );
    }

    // Otherwise render as div
    return (
      <div
        ref={ref}
        className={`
          w-full p-4 rounded-xl border-2 ${config.border} ${config.background} 
          ${isCompleted ? 'opacity-60' : ''} 
          transition-all duration-200 hover:scale-[1.02] hover:shadow-md 
          text-right ${className}
        `}
        role="article"
        aria-label={`کار: ${title}${isCompleted ? ' (تکمیل شده)' : ''}`}
      >
        <CardContent />
      </div>
    );
  }
);

TaskCard.displayName = 'TaskCard';

export default TaskCard;
