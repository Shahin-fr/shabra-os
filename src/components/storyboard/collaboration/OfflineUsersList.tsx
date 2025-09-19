'use client';

import { WifiOff } from 'lucide-react';
import { memo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OfflineUsersListProps } from '@/types/collaboration';

export const OfflineUsersList = memo<OfflineUsersListProps>(
  ({ users, className = '' }) => {
    if (users.length === 0) {
      return null;
    }

    return (
      <div className={className}>
        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          کاربران آفلاین ({users.length})
        </h4>
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.userId}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md opacity-60"
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={user.userAvatar} />
                <AvatarFallback className="text-xs">
                  {user.userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.userName}
              </span>
              <WifiOff className="w-3 h-3 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

OfflineUsersList.displayName = 'OfflineUsersList';

