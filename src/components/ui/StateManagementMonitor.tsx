/**
 * State Management Monitor
 *
 * This component displays real-time metrics and performance data
 * for the consolidated state management system.
 */

'use client';

import {
  BarChart3,
  Database,
  Clock,
  Zap,
  Trash2,
  RefreshCw,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  useCacheStats,
  useCacheActions,
  useAppSettings,
  useAppActions,
} from '@/stores/consolidated-store';

export function StateManagementMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Cache statistics and performance
  const cacheStats = useCacheStats();

  // Calculate performance metrics
  const hitRate =
    cacheStats.hitCount + cacheStats.missCount > 0
      ? (cacheStats.hitCount / (cacheStats.hitCount + cacheStats.missCount)) *
        100
      : 0;

  const isHealthy = hitRate > 70 && cacheStats.totalSize < 25 * 1024 * 1024; // 25MB

  const recommendations: string[] = [];
  if (hitRate < 70) {
    recommendations.push(
      'Consider increasing cache TTL for frequently accessed data'
    );
  }
  if (cacheStats.totalSize > 25 * 1024 * 1024) {
    recommendations.push(
      'Cache size is large, consider reducing TTL or implementing LRU eviction'
    );
  }
  if (cacheStats.totalEntries > 800) {
    recommendations.push(
      'High number of cache entries, consider consolidating related data'
    );
  }

  // App settings and actions
  const appSettings = useAppSettings();
  const { updateSettings } = useAppActions();

  // Cache actions
  const { clear, cleanup } = useCacheActions();

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Toggle visibility
  const toggleVisibility = () => setIsVisible(!isVisible);

  // Handle cache strategy change
  const handleStrategyChange = (
    strategy: 'aggressive' | 'balanced' | 'minimal'
  ) => {
    updateSettings({ cacheStrategy: strategy });
  };

  // Handle cache cleanup
  const handleCacheCleanup = () => {
    cleanup();
    setLastUpdate(new Date());
  };

  // Handle cache clear
  const handleCacheClear = () => {
    clear();
    setLastUpdate(new Date());
  };

  if (!isVisible) {
    return (
      <Button
        variant='outline'
        size='sm'
        onClick={toggleVisibility}
        className='fixed bottom-4 right-4 z-50'
      >
        <BarChart3 className='h-4 w-4 mr-2' />
        State Monitor
      </Button>
    );
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto'>
      <Card className='shadow-2xl border-2'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg flex items-center'>
              <BarChart3 className='h-5 w-5 mr-2' />
              State Management Monitor
            </CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleVisibility}
              className='h-8 w-8 p-0'
            >
              ×
            </Button>
          </div>
          <div className='text-xs text-muted-foreground'>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Cache Performance Overview */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h4 className='font-semibold text-sm'>Cache Performance</h4>
              <Badge
                variant={isHealthy ? 'default' : 'destructive'}
                className='text-xs'
              >
                {isHealthy ? (
                  <CheckCircle className='h-3 w-3 mr-1' />
                ) : (
                  <AlertTriangle className='h-3 w-3 mr-1' />
                )}
                {isHealthy ? 'Healthy' : 'Needs Attention'}
              </Badge>
            </div>

            {/* Hit Rate */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span>Hit Rate</span>
                <span className='font-mono'>{hitRate.toFixed(1)}%</span>
              </div>
              <Progress
                value={hitRate}
                className='h-2'
                indicatorClassName={
                  hitRate > 70 ? 'bg-green-500' : 'bg-yellow-500'
                }
              />
            </div>

            {/* Cache Size */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span>Cache Size</span>
                <span className='font-mono'>
                  {(cacheStats.totalSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Progress
                value={(cacheStats.totalSize / (25 * 1024 * 1024)) * 100}
                className='h-2'
                indicatorClassName={
                  cacheStats.totalSize > 25 * 1024 * 1024
                    ? 'bg-red-500'
                    : 'bg-green-500'
                }
              />
            </div>
          </div>

          {/* Cache Statistics */}
          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div className='flex items-center space-x-2'>
              <Database className='h-4 w-4 text-blue-500' />
              <span>Entries: {cacheStats.totalEntries}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Clock className='h-4 w-4 text-green-500' />
              <span>Hits: {cacheStats.hitCount}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <TrendingDown className='h-4 w-4 text-red-500' />
              <span>Misses: {cacheStats.missCount}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Zap className='h-4 w-4 text-yellow-500' />
              <span>
                Avg Size:{' '}
                {cacheStats.totalEntries > 0
                  ? (
                      cacheStats.totalSize /
                      cacheStats.totalEntries /
                      1024
                    ).toFixed(1)
                  : '0'}{' '}
                KB
              </span>
            </div>
          </div>

          {/* Cache Strategy */}
          <div className='space-y-2'>
            <h4 className='font-semibold text-sm'>Cache Strategy</h4>
            <div className='flex space-x-1'>
              {(['minimal', 'balanced', 'aggressive'] as const).map(
                strategy => (
                  <Button
                    key={strategy}
                    variant={
                      appSettings.cacheStrategy === strategy
                        ? 'default'
                        : 'outline'
                    }
                    size='sm'
                    onClick={() => handleStrategyChange(strategy)}
                    className='flex-1 text-xs capitalize'
                  >
                    {strategy}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Performance Recommendations */}
          {recommendations.length > 0 && (
            <div className='space-y-2'>
              <h4 className='font-semibold text-sm text-amber-600'>
                Recommendations
              </h4>
              <div className='space-y-1'>
                {recommendations.map((rec: string, index: number) => (
                  <div
                    key={index}
                    className='text-xs text-amber-700 bg-amber-50 p-2 rounded'
                  >
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cache Actions */}
          <div className='flex space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCacheCleanup}
              className='flex-1'
            >
              <RefreshCw className='h-4 w-4 mr-1' />
              Cleanup
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCacheClear}
              className='flex-1'
            >
              <Trash2 className='h-4 w-4 mr-1' />
              Clear All
            </Button>
          </div>

          {/* Performance Metrics */}
          <div className='space-y-2'>
            <h4 className='font-semibold text-sm'>Performance Metrics</h4>
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <div className='bg-muted p-2 rounded'>
                <div className='font-medium'>Memory Usage</div>
                <div className='text-muted-foreground'>
                  {(cacheStats.totalSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <div className='bg-muted p-2 rounded'>
                <div className='font-medium'>Efficiency</div>
                <div className='text-muted-foreground'>
                  {hitRate.toFixed(1)}%
                </div>
              </div>
              <div className='bg-muted p-2 rounded'>
                <div className='font-medium'>Last Cleanup</div>
                <div className='text-muted-foreground'>
                  {cacheStats.lastCleanup.toLocaleTimeString()}
                </div>
              </div>
              <div className='bg-muted p-2 rounded'>
                <div className='font-medium'>Status</div>
                <div className='text-muted-foreground'>
                  {isHealthy ? 'Optimal' : 'Suboptimal'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StateManagementMonitor;
