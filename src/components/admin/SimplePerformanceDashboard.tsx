/**
 * Simple Performance Dashboard
 * 
 * Basic dashboard showing essential performance metrics.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Monitor, Database, Memory } from 'lucide-react';
import { simplePerformanceMonitor } from '@/lib/performance/simple-monitor';
import { useCacheStats } from '@/stores/cache.store';

export default function SimplePerformanceDashboard() {
  const [metrics, setMetrics] = useState(simplePerformanceMonitor.getMetrics());
  const [loading, setLoading] = useState(false);
  const cacheStats = useCacheStats();

  const refreshMetrics = useCallback(() => {
    setLoading(true);
    const newMetrics = simplePerformanceMonitor.getMetrics();
    newMetrics.cacheHitRate = cacheStats.hitCount + cacheStats.missCount > 0 
      ? (cacheStats.hitCount / (cacheStats.hitCount + cacheStats.missCount)) * 100 
      : 0;
    setMetrics(newMetrics);
    setLoading(false);
  }, [cacheStats.hitCount, cacheStats.missCount]);

  useEffect(() => {
    simplePerformanceMonitor.startMonitoring();
    refreshMetrics();
    
    const interval = setInterval(refreshMetrics, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  const formatTime = (ms: number | null) => {
    if (ms === null) return 'N/A';
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusColor = (value: number | null, good: number, warning: number) => {
    if (value === null) return 'bg-gray-500';
    if (value <= good) return 'bg-green-500';
    if (value <= warning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">Essential performance metrics</p>
        </div>
        <Button onClick={refreshMetrics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LCP */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LCP</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics.lcp)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.lcp, 2500, 4000)}`} />
              <span className="text-sm text-muted-foreground">
                {metrics.lcp && metrics.lcp <= 2500 ? 'Good' : 
                 metrics.lcp && metrics.lcp <= 4000 ? 'Needs Improvement' : 'Poor'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* FID */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FID</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics.fid)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.fid, 100, 300)}`} />
              <span className="text-sm text-muted-foreground">
                {metrics.fid && metrics.fid <= 100 ? 'Good' : 
                 metrics.fid && metrics.fid <= 300 ? 'Needs Improvement' : 'Poor'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* CLS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CLS</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cls !== null ? metrics.cls.toFixed(3) : 'N/A'}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.cls, 0.1, 0.25)}`} />
              <span className="text-sm text-muted-foreground">
                {metrics.cls !== null && metrics.cls <= 0.1 ? 'Good' : 
                 metrics.cls !== null && metrics.cls <= 0.25 ? 'Needs Improvement' : 'Poor'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cache Hit Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.cacheHitRate, 70, 50)}`} />
              <span className="text-sm text-muted-foreground">
                {metrics.cacheHitRate >= 70 ? 'Good' : 
                 metrics.cacheHitRate >= 50 ? 'Needs Improvement' : 'Poor'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
            <CardDescription>JavaScript heap usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(metrics.memoryUsed)}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Statistics</CardTitle>
            <CardDescription>Current cache performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Entries:</span>
                <span className="font-mono">{cacheStats.totalEntries}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Size:</span>
                <span className="font-mono">{formatBytes(cacheStats.totalSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hit Count:</span>
                <span className="font-mono">{cacheStats.hitCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Miss Count:</span>
                <span className="font-mono">{cacheStats.missCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
