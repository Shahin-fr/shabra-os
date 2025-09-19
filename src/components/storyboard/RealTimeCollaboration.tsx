'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { useRealtimeCollab } from '@/hooks/useRealtimeCollab';
import { RealTimeCollaborationProps } from '@/types/collaboration';
import { PresenceIndicator, CollaborationPanel } from './collaboration';

export function RealTimeCollaboration({
  storyId,
  onStoryUpdate,
  className = '',
}: RealTimeCollaborationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use the real-time collaboration hook
  const {
    connectionStatus,
    onlineUsers,
    offlineUsers,
    conflicts,
    resolveConflict,
  } = useRealtimeCollab({
    storyId,
    onStoryUpdate,
  });

  // Handle conflict resolution
  const handleResolveConflict = (conflictId: string, resolution: 'accepted' | 'rejected' | 'merged') => {
    resolveConflict(conflictId, resolution);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Presence Indicator Button */}
      <PresenceIndicator
        users={onlineUsers}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {/* Collaboration Panel */}
      <CollaborationPanel
        isExpanded={isExpanded}
        connectionStatus={connectionStatus}
        onlineUsers={onlineUsers}
        offlineUsers={offlineUsers}
        conflicts={conflicts}
        onResolveConflict={handleResolveConflict}
      />
    </div>
  );
}

