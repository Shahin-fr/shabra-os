'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@/lib/utils';
import { ConnectionStatusProps } from '@/types/collaboration';

export const ConnectionStatus = memo<ConnectionStatusProps>(
  ({ status, className = '' }) => {
    const getStatusInfo = () => {
      switch (status) {
        case 'connected':
          return {
            text: 'متصل',
            icon: Wifi,
            className: 'text-green-500',
            badgeClassName: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
          };
        case 'connecting':
          return {
            text: 'در حال اتصال...',
            icon: Wifi,
            className: 'text-yellow-500 animate-pulse',
            badgeClassName: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
          };
        case 'reconnecting':
          return {
            text: 'در حال اتصال مجدد...',
            icon: Wifi,
            className: 'text-yellow-500 animate-pulse',
            badgeClassName: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
          };
        case 'disconnected':
        default:
          return {
            text: 'قطع اتصال',
            icon: WifiOff,
            className: 'text-red-500',
            badgeClassName: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
          };
      }
    };

    const statusInfo = getStatusInfo();
    const Icon = statusInfo.icon;

    return (
      <div className={cn('pt-2 border-t border-gray-200 dark:border-gray-700', className)}>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Icon className={cn('w-4 h-4', statusInfo.className)} />
            <span>وضعیت اتصال:</span>
          </div>
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs',
              statusInfo.badgeClassName
            )}
          >
            {statusInfo.text}
          </span>
        </div>
      </div>
    );
  }
);

ConnectionStatus.displayName = 'ConnectionStatus';

