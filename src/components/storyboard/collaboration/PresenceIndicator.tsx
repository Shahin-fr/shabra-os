'use client';

import { AnimatePresence } from 'framer-motion';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Users, Circle } from 'lucide-react';
import { memo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PresenceIndicatorProps } from '@/types/collaboration';

export const PresenceIndicator = memo<PresenceIndicatorProps>(
  ({ users, isExpanded, onToggle, className = '' }) => {
    const onlineUsers = users.filter(user => user.isOnline);

    return (
      <div className={cn('relative', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="relative"
        >
          <Users className="w-4 h-4 me-2" />
          <span className="hidden sm:inline">همکاری</span>

          {/* Online indicator */}
          <div className="absolute -top-1 -end-1">
            <Circle
              className={cn(
                'w-3 h-3',
                onlineUsers.length > 0 ? 'text-green-500 fill-green-500' : 'text-gray-400'
              )}
            />
          </div>

          {/* User count badge */}
          {onlineUsers.length > 0 && (
            <Badge variant="secondary" className="ms-2">
              {onlineUsers.length}
            </Badge>
          )}
        </Button>

        {/* Expanded Collaboration Panel */}
        <AnimatePresence>
          {isExpanded && (
            <OptimizedMotion
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full end-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            >
              {/* This will be rendered by the parent component */}
            </OptimizedMotion>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PresenceIndicator.displayName = 'PresenceIndicator';

