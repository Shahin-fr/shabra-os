'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, RefreshCw } from 'lucide-react';
import React, { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { SkeletonListStaggered } from '@/components/ui/skeleton-loaders';
import { cn } from '@/lib/utils';

import { MobileDataCard } from './MobileDataCard';

interface Column {
  key: string;
  label: string;
  render?: (value: any, _item: any) => React.ReactNode;
}

interface MobileDataListProps {
  data: any[];
  columns: Column[];
  onRowPress?: (_item: any) => void;
  searchable?: boolean;
  filterable?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function MobileDataList({
  data,
  columns,
  onRowPress,
  searchable = true,
  filterable = false,
  onRefresh,
  isLoading = false,
  emptyMessage = 'داده‌ای یافت نشد',
  className: _className,
}: MobileDataListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;

    return columns.some(column => {
      const value = item[column.key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onRefresh]);

  const getCardProps = (item: any) => {
    const titleColumn = columns.find(
      col => col.key === 'title' || col.key === 'name'
    );
    const subtitleColumn = columns.find(
      col => col.key === 'subtitle' || col.key === 'description'
    );
    const statusColumn = columns.find(col => col.key === 'status');

    return {
      title: titleColumn
        ? titleColumn.render
          ? titleColumn.render(item[titleColumn.key], item)
          : item[titleColumn.key]
        : 'بدون عنوان',
      subtitle: subtitleColumn
        ? subtitleColumn.render
          ? subtitleColumn.render(item[subtitleColumn.key], item)
          : item[subtitleColumn.key]
        : undefined,
      description:
        subtitleColumn && subtitleColumn.key === 'description'
          ? item[subtitleColumn.key]
          : undefined,
      status: statusColumn
        ? {
            label: statusColumn.render
              ? statusColumn.render(item[statusColumn.key], item)
              : item[statusColumn.key],
            variant: 'default' as const,
          }
        : undefined,
      metadata: columns
        .filter(
          col =>
            !['title', 'name', 'subtitle', 'description', 'status'].includes(
              col.key
            )
        )
        .slice(0, 4) // Limit to 4 metadata items
        .map(col => ({
          label: col.label,
          value: col.render ? col.render(item[col.key], item) : item[col.key],
        })),
      onPress: onRowPress ? () => onRowPress(item) : undefined,
    };
  };

  return (
    <div className={cn('space-y-4', _className)}>
      {/* Header with Search and Actions */}
      {(searchable || filterable || onRefresh) && (
        <div className='flex gap-3'>
          {searchable && (
            <div className='flex-1 relative'>
              <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='جستجو...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pr-10 h-10'
              />
            </div>
          )}

          {filterable && (
            <Button variant='outline' size='sm' className='h-10 px-3'>
              <Filter className='h-4 w-4' />
            </Button>
          )}

          {onRefresh && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='h-10 px-3'
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
            </Button>
          )}
        </div>
      )}

      {/* Data List with Pull-to-Refresh */}
      <PullToRefresh
        onRefresh={onRefresh || (() => Promise.resolve())}
        enabled={!!onRefresh}
        showSuccessFeedback={true}
      >
        <div className='space-y-3'>
          <AnimatePresence>
            {isLoading ? (
              <SkeletonListStaggered count={5} />
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <MobileDataCard {...getCardProps(item)} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-center py-12'
              >
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Search className='h-8 w-8 text-gray-400' />
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  {emptyMessage}
                </h3>
                <p className='text-sm text-gray-500'>
                  {searchTerm
                    ? 'نتیجه‌ای برای جستجوی شما یافت نشد'
                    : 'هنوز داده‌ای اضافه نشده است'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PullToRefresh>
    </div>
  );
}
