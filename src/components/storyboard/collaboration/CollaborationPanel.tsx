'use client';

import { memo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ConnectionStatus } from './ConnectionStatus';
import { ConflictsList } from './ConflictsList';
import { OfflineUsersList } from './OfflineUsersList';
import { OnlineUsersList } from './OnlineUsersList';
import { ConnectionStatus as ConnectionStatusType, PresenceIndicator, CollaborationConflict } from '@/types/collaboration';

interface CollaborationPanelProps {
  isExpanded: boolean;
  connectionStatus: ConnectionStatusType;
  onlineUsers: PresenceIndicator[];
  offlineUsers: PresenceIndicator[];
  conflicts: CollaborationConflict[];
  onResolveConflict: (conflictId: string, resolution: 'accepted' | 'rejected' | 'merged') => void;
  className?: string;
}

export const CollaborationPanel = memo<CollaborationPanelProps>(
  ({
    isExpanded,
    connectionStatus,
    onlineUsers,
    offlineUsers,
    conflicts,
    onResolveConflict,
    className = '',
  }) => {
    if (!isExpanded) {
      return null;
    }

    const isConnected = connectionStatus === 'connected';

    return (
      <div className={cn('absolute top-full end-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50', className)}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wifi
                className={cn(
                  'w-4 h-4',
                  isConnected ? 'text-green-500' : 'text-red-500'
                )}
              />
              {isConnected ? 'متصل' : 'قطع اتصال'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Online Users */}
            <OnlineUsersList users={onlineUsers} />

            {/* Offline Users */}
            <OfflineUsersList users={offlineUsers} />

            {/* Conflicts */}
            <ConflictsList
              conflicts={conflicts}
              onResolve={onResolveConflict}
            />

            {/* Connection Status */}
            <ConnectionStatus status={connectionStatus} />
          </CardContent>
        </Card>
      </div>
    );
  }
);

CollaborationPanel.displayName = 'CollaborationPanel';

