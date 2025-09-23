// Implements: [CRITICAL PRIORITY 7: Error Handling & Recovery Systems]
// See: docs/ROADMAP/PHASE_2_STRATEGIC_PLAN.md, Section 3.2

'use client';

import React, { useState } from 'react';

import { ErrorCategory, ErrorPriority } from '../../types/error';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: Error;
  category?: ErrorCategory;
  priority?: ErrorPriority;
  component?: string;
  action?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  category,
  priority,
  component,
  action,
  onRetry,
  onDismiss,

  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-detect category and priority if not provided
  const detectedCategory = category || getErrorCategory(error);
  const detectedPriority =
    priority || getErrorPriority(error, detectedCategory);

  // Get recovery guidance
  // Error recovery guidance could be implemented here in the future

  // Get priority color and icon
  const priorityConfig = getPriorityConfig(detectedPriority);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      {/* Error Header */}
      <div className={`px-4 py-3 border-b ${priorityConfig.borderColor}`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${priorityConfig.bgColor}`}
            >
              {priorityConfig.icon}
            </div>
            <div>
              <h3 className={`text-sm font-medium ${priorityConfig.textColor}`}>
                {priorityConfig.title}
              </h3>
              <p className='text-xs text-gray-500'>
                {component && action
                  ? `${component} • ${action}`
                  : 'System Error'}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            {onRetry && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className='text-xs'
              >
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className='text-xs'
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Content */}
      <div className='px-4 py-3'>
        {/* User-friendly message */}
        <p className='text-sm text-gray-700 mb-3'>
          An error occurred. Please try again or contact support.
        </p>

        {/* Recovery actions and next steps could be implemented here in the future */}

        {/* Expandable details */}
        <div className='border-t pt-3'>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors'
          >
            <span>{isExpanded ? 'Hide' : 'Show'} technical details</span>
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>

          {isExpanded && (
            <div className='mt-3 space-y-2'>
              <div className='text-xs'>
                <span className='font-medium text-gray-700'>Error Type:</span>
                <span className='ml-2 text-gray-600'>{detectedCategory}</span>
              </div>
              <div className='text-xs'>
                <span className='font-medium text-gray-700'>Priority:</span>
                <span className={`ml-2 ${priorityConfig.textColor}`}>
                  {detectedPriority}
                </span>
              </div>
              <div className='text-xs'>
                <span className='font-medium text-gray-700'>Message:</span>
                <span className='ml-2 text-gray-600 font-mono'>
                  {error.message}
                </span>
              </div>
              {error.stack && (
                <div className='text-xs'>
                  <span className='font-medium text-gray-700'>
                    Stack Trace:
                  </span>
                  <pre className='mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto'>
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get error category
function getErrorCategory(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (name.includes('validation') || message.includes('validation')) {
    return 'VALIDATION_ERROR';
  }
  if (name.includes('auth') || message.includes('unauthorized')) {
    return 'AUTHENTICATION_ERROR';
  }
  if (name.includes('database') || message.includes('prisma')) {
    return 'DATABASE_ERROR';
  }
  if (name.includes('network') || message.includes('fetch')) {
    return 'NETWORK_ERROR';
  }
  if (name.includes('api')) {
    return 'API_ERROR';
  }
  if (name.includes('performance')) {
    return 'PERFORMANCE_ERROR';
  }
  if (name.includes('build')) {
    return 'BUILD_ERROR';
  }

  return 'UI_ERROR';
}

// Helper function to get error priority
function getErrorPriority(
  _error: Error,
  category: ErrorCategory
): ErrorPriority {
  if (category === 'AUTHENTICATION_ERROR' || category === 'DATABASE_ERROR') {
    return 'CRITICAL';
  }
  if (category === 'API_ERROR' || category === 'NETWORK_ERROR') {
    return 'HIGH';
  }
  if (category === 'VALIDATION_ERROR') {
    return 'MEDIUM';
  }
  return 'LOW';
}

// Helper function to get priority configuration
function getPriorityConfig(priority: ErrorPriority) {
  const configs = {
    CRITICAL: {
      title: 'Critical Error',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: (
        <svg
          className='w-4 h-4 text-red-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      ),
    },
    HIGH: {
      title: 'High Priority Error',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      icon: (
        <svg
          className='w-4 h-4 text-orange-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      ),
    },
    MEDIUM: {
      title: 'Medium Priority Error',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: (
        <svg
          className='w-4 h-4 text-yellow-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      ),
    },
    LOW: {
      title: 'Low Priority Error',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: (
        <svg
          className='w-4 h-4 text-blue-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      ),
    },
  };

  return configs[priority];
}

