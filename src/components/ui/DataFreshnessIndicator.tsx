import { RefreshCw, Clock, CheckCircle } from 'lucide-react';
import React, { memo } from 'react';

import { Button } from './button';
import { Tooltip } from './tooltip';

interface DataFreshnessIndicatorProps {
  lastUpdated: Date | null;
  isRefetching: boolean;
  onRefresh: () => void;
  showRefreshButton?: boolean;
  className?: string;
}

const DataFreshnessIndicator = memo<DataFreshnessIndicatorProps>(
  ({
    lastUpdated,
    isRefetching,
    onRefresh,
    showRefreshButton = true,
    className = '',
  }) => {
    const getTimeAgo = (date: Date): string => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds} ثانیه پیش`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} دقیقه پیش`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ساعت پیش`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} روز پیش`;
      }
    };

    const getFreshnessColor = (date: Date): string => {
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 5) return 'text-green-600';
      if (diffInMinutes < 15) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getFreshnessIcon = (date: Date) => {
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 5) return <CheckCircle className='h-3 w-3' />;
      if (diffInMinutes < 15) return <Clock className='h-3 w-3' />;
      return <Clock className='h-3 w-3' />;
    };

    if (!lastUpdated) {
      return (
        <div
          className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}
        >
          <Clock className='h-3 w-3' />
          <span>داده‌ای موجود نیست</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <div className='flex items-center gap-1'>
          {getFreshnessIcon(lastUpdated)}
          <span className={getFreshnessColor(lastUpdated)}>
            {getTimeAgo(lastUpdated)}
          </span>
        </div>

        {showRefreshButton && (
          <Tooltip content='به‌روزرسانی دستی'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onRefresh}
              disabled={isRefetching}
              className='h-6 w-6 p-0 hover:bg-gray-100'
            >
              <RefreshCw
                className={`h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`}
              />
            </Button>
          </Tooltip>
        )}
      </div>
    );
  }
);

DataFreshnessIndicator.displayName = 'DataFreshnessIndicator';

export { DataFreshnessIndicator };
