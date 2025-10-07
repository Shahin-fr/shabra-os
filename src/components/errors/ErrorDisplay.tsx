'use client';

import React from 'react';
import { ClientError } from '@/contexts/ErrorContext';

interface ErrorDisplayProps {
  error: ClientError;
  onRetry?: () => void;
  onDismiss?: () => void;
  onReport?: () => void;
  variant?: 'toast' | 'banner' | 'modal' | 'inline';
  showDetails?: boolean;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  onReport,
  variant = 'toast',
  showDetails = false,
}: ErrorDisplayProps) {
  const getSeverityColor = (severity: ClientError['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'critical':
        return 'text-red-800 bg-red-100 border-red-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: ClientError['severity']) => {
    switch (severity) {
      case 'low':
        return '⚠️';
      case 'medium':
        return '⚠️';
      case 'high':
        return '🚨';
      case 'critical':
        return '💥';
      default:
        return '❌';
    }
  };

  const getTypeMessage = (type: ClientError['type']) => {
    switch (type) {
      case 'network':
        return 'Network connection issue';
      case 'validation':
        return 'Input validation error';
      case 'authentication':
        return 'Authentication required';
      case 'authorization':
        return 'Access denied';
      case 'unknown':
        return 'Unexpected error';
      default:
        return 'Error occurred';
    }
  };

  const baseClasses = `rounded-lg border p-4 ${getSeverityColor(error.severity)}`;

  if (variant === 'toast') {
    return (
      <div className={`${baseClasses} shadow-lg max-w-md`}>
        <div className="flex items-start">
          <span className="text-lg mr-2">{getSeverityIcon(error.severity)}</span>
          <div className="flex-1">
            <h4 className="font-medium text-sm">
              {getTypeMessage(error.type)}
            </h4>
            <p className="text-sm mt-1">{error.message}</p>
            {showDetails && error.context && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">Details</summary>
                <pre className="text-xs mt-1 overflow-auto">
                  {JSON.stringify(error.context, null, 2)}
                </pre>
              </details>
            )}
          </div>
          <div className="flex space-x-2 ml-2">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50"
                disabled={error.retryCount >= error.maxRetries}
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`${baseClasses} w-full`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-lg mr-3">{getSeverityIcon(error.severity)}</span>
            <div>
              <h4 className="font-medium">
                {getTypeMessage(error.type)}
              </h4>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50 text-sm"
                disabled={error.retryCount >= error.maxRetries}
              >
                Retry
              </button>
            )}
            {onReport && (
              <button
                onClick={onReport}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50 text-sm"
              >
                Report
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50 text-sm"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${baseClasses} max-w-md w-full mx-4`}>
          <div className="flex items-start">
            <span className="text-2xl mr-3">{getSeverityIcon(error.severity)}</span>
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">
                {getTypeMessage(error.type)}
              </h3>
              <p className="text-sm mb-4">{error.message}</p>
              
              {showDetails && error.context && (
                <details className="mb-4">
                  <summary className="text-sm cursor-pointer font-medium">Error Details</summary>
                  <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </details>
              )}

              <div className="flex space-x-2">
                {error.retryable && onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    disabled={error.retryCount >= error.maxRetries}
                  >
                    {error.retryCount >= error.maxRetries ? 'Max Retries' : 'Retry'}
                  </button>
                )}
                {onReport && (
                  <button
                    onClick={onReport}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    Report Error
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // inline variant
  return (
    <div className={`${baseClasses} w-full`}>
      <div className="flex items-start">
        <span className="text-sm mr-2">{getSeverityIcon(error.severity)}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {getTypeMessage(error.type)}: {error.message}
          </p>
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              disabled={error.retryCount >= error.maxRetries}
            >
              {error.retryCount >= error.maxRetries ? 'Max retries reached' : 'Retry'}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// Error list component
interface ErrorListProps {
  errors: ClientError[];
  onRetry?: (errorId: string) => void;
  onDismiss?: (errorId: string) => void;
  onReport?: (errorId: string) => void;
  variant?: 'toast' | 'banner' | 'inline';
  maxDisplay?: number;
}

export function ErrorList({
  errors,
  onRetry,
  onDismiss,
  onReport,
  variant = 'toast',
  maxDisplay = 5,
}: ErrorListProps) {
  const displayErrors = errors.slice(0, maxDisplay);
  const remainingCount = errors.length - maxDisplay;

  return (
    <div className="space-y-2">
      {displayErrors.map((error) => (
        <ErrorDisplay
          key={error.id}
          error={error}
          onRetry={onRetry ? () => onRetry(error.id) : undefined}
          onDismiss={onDismiss ? () => onDismiss(error.id) : undefined}
          onReport={onReport ? () => onReport(error.id) : undefined}
          variant={variant}
        />
      ))}
      {remainingCount > 0 && (
        <div className="text-sm text-gray-500 text-center">
          +{remainingCount} more error{remainingCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// Error toast container
interface ErrorToastContainerProps {
  errors: ClientError[];
  onRetry?: (errorId: string) => void;
  onDismiss?: (errorId: string) => void;
  onReport?: (errorId: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ErrorToastContainer({
  errors,
  onRetry,
  onDismiss,
  onReport,
  position = 'top-right',
}: ErrorToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 max-w-sm`}>
      <ErrorList
        errors={errors}
        onRetry={onRetry}
        onDismiss={onDismiss}
        onReport={onReport}
        variant="toast"
      />
    </div>
  );
}
