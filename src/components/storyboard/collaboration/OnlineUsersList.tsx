'use client';

import { memo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { OnlineUsersListProps } from '@/types/collaboration';

export const OnlineUsersList = memo<OnlineUsersListProps>(
  ({ users, className = '' }) => {
    if (users.length === 0) {
      return (
        <div className={className}>
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            کاربران آنلاین (0)
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            هیچ کاربری در حال حاضر آنلاین نیست
          </p>
        </div>
      );
    }

    return (
      <div className={className}>
        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          کاربران آنلاین ({users.length})
        </h4>
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.userId}
              className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md"
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
              <Badge variant="outline" className="text-xs">
                {user.currentAction}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

OnlineUsersList.displayName = 'OnlineUsersList';

