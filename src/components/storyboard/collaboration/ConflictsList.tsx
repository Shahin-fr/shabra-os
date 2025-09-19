'use client';

import { memo } from 'react';

import { ConflictsListProps } from '@/types/collaboration';

export const ConflictsList = memo<ConflictsListProps>(
  ({ conflicts, onResolve, className = '' }) => {
    if (conflicts.length === 0) {
      return null;
    }

    return (
      <div className={className}>
        <h4 className="text-sm font-medium mb-2 text-red-700 dark:text-red-300">
          تعارضات ({conflicts.length})
        </h4>
        <div className="space-y-2">
          {conflicts.map(conflict => (
            <div
              key={conflict.id}
              className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800"
            >
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                {conflict.message}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onResolve(conflict.id, 'accepted')}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                >
                  قبول
                </button>
                <button
                  onClick={() => onResolve(conflict.id, 'rejected')}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                >
                  رد
                </button>
                <button
                  onClick={() => onResolve(conflict.id, 'merged')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                >
                  ادغام
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ConflictsList.displayName = 'ConflictsList';

