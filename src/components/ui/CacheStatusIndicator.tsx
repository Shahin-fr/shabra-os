'use client';

import { RefreshCw, Trash2, Database, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  cacheManager,
  getCacheStatus,
  getCacheStats,
  ContentType,
} from '@/lib/cache-manager';
import { logger } from '@/lib/logger';

import { Badge } from './badge';
import { Button } from './button';

interface CacheStatusIndicatorProps {
  showControls?: boolean;
  className?: string;
}

export function CacheStatusIndicator({
  showControls = false,
  className = '',
}: CacheStatusIndicatorProps) {
  const [cacheStatus, setCacheStatus] = useState<
    'unknown' | 'clean' | 'dirty' | 'updating'
  >('unknown');
  const [serviceWorkerStatus, setServiceWorkerStatus] =
    useState<string>('unknown');
  const [cacheStats, setCacheStats] = useState<{
    totalCaches: number;
    totalSize: number;
    lastCleared?: Date;
    version: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateCacheStatus();
    updateCacheStats();

    // Update status every 30 seconds
    const interval = setInterval(() => {
      updateCacheStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateCacheStatus = async () => {
    try {
      const status = await getCacheStatus();
      setCacheStatus(status.status);
      setServiceWorkerStatus(status.serviceWorkerStatus || 'unknown');
    } catch (error) {
      logger.warn('Failed to get cache status:', error as Error);
    }
  };

  const updateCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      logger.warn('Failed to get cache stats:', error as Error);
    }
  };

  const handleClearAllCaches = async () => {
    setIsLoading(true);
    try {
      await cacheManager.clearAllCaches();
      await updateCacheStatus();
      await updateCacheStats();
      logger.info('All caches cleared successfully');
    } catch (error) {
      logger.error('Failed to clear caches:', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvalidateContent = async (contentType: ContentType) => {
    setIsLoading(true);
    try {
      await cacheManager.invalidateContentCache(contentType);
      await updateCacheStatus();
      await updateCacheStats();
      logger.info('Cache invalidated for ${contentType}');
    } catch (error) {
      logger.error(
        `Failed to invalidate cache for ${contentType}:`,
        error as Error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceRefresh = async (contentType: ContentType) => {
    setIsLoading(true);
    try {
      await cacheManager.forceRefresh(contentType);
    } catch (error) {
      logger.error(
        `Failed to force refresh for ${contentType}:`,
        error as Error
      );
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clean':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dirty':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceWorkerColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'installing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'redundant':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Cache Status Display */}
      <div className='flex items-center gap-2'>
        <Database className='h-4 w-4 text-gray-600' />
        <span className='text-sm font-medium text-gray-700'>Cache Status:</span>
        <Badge className={`text-xs ${getStatusColor(cacheStatus)}`}>
          {cacheStatus === 'clean'
            ? 'Clean'
            : cacheStatus === 'dirty'
              ? 'Needs Refresh'
              : 'Unknown'}
        </Badge>
      </div>

      {/* Service Worker Status */}
      <div className='flex items-center gap-2'>
        <Info className='h-4 w-4 text-gray-600' />
        <span className='text-sm font-medium text-gray-700'>
          Service Worker:
        </span>
        <Badge
          className={`text-xs ${getServiceWorkerColor(serviceWorkerStatus)}`}
        >
          {serviceWorkerStatus}
        </Badge>
      </div>

      {/* Cache Statistics */}
      {cacheStats && (
        <div className='text-xs text-gray-600 space-y-1'>
          <div>Version: {cacheStats.version}</div>
          <div>Caches: {cacheStats.totalCaches}</div>
          <div>Size: {formatBytes(cacheStats.totalSize)}</div>
          {cacheStats.lastCleared && (
            <div>Last Cleared: {cacheStats.lastCleared.toLocaleString()}</div>
          )}
        </div>
      )}

      {/* Cache Management Controls */}
      {showControls && (
        <div className='space-y-2 pt-2 border-t border-gray-200'>
          <div className='text-sm font-medium text-gray-700'>
            Cache Management:
          </div>

          <div className='flex flex-wrap gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={handleClearAllCaches}
              disabled={isLoading}
              className='text-xs'
            >
              <Trash2 className='h-3 w-3 mr-1' />
              Clear All
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={() => handleInvalidateContent('calendar')}
              disabled={isLoading}
              className='text-xs'
            >
              <RefreshCw className='h-3 w-3 mr-1' />
              Clear Calendar
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={() => handleInvalidateContent('projects')}
              disabled={isLoading}
              className='text-xs'
            >
              <RefreshCw className='h-3 w-3 mr-1' />
              Clear Projects
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={() => handleInvalidateContent('stories')}
              disabled={isLoading}
              className='text-xs'
            >
              <RefreshCw className='h-3 w-3 mr-1' />
              Clear Stories
            </Button>
          </div>

          <div className='flex flex-wrap gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => handleForceRefresh('calendar')}
              disabled={isLoading}
              className='text-xs'
            >
              <RefreshCw className='h-3 w-3 mr-1' />
              Force Refresh Calendar
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={updateCacheStats}
              disabled={isLoading}
              className='text-xs'
            >
              <RefreshCw className='h-3 w-3 mr-1' />
              Update Stats
            </Button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className='flex items-center gap-2 text-sm text-blue-600'>
          <RefreshCw className='h-4 w-4 animate-spin' />
          Processing...
        </div>
      )}
    </div>
  );
}

