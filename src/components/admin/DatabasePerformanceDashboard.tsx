'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Database, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface DatabasePerformanceData {
  slowQueries: Array<{
    query: string;
    calls: number;
    total_time: number;
    mean_time: number;
    rows: number;
    hit_percent: number;
  }>;
  tableSizes: Array<{
    schemaname: string;
    tablename: string;
    size: string;
    size_bytes: number;
  }>;
  indexUsage: Array<{
    schemaname: string;
    tablename: string;
    indexname: string;
    idx_scan: number;
    idx_tup_read: number;
    idx_tup_fetch: number;
  }>;
  connectionStats: Array<{
    state: string;
    connections: number;
  }>;
  queryStats: Array<{
    datname: string;
    numbackends: number;
    xact_commit: number;
    xact_rollback: number;
    blks_read: number;
    blks_hit: number;
    tup_returned: number;
    tup_fetched: number;
    tup_inserted: number;
    tup_updated: number;
    tup_deleted: number;
  }>;
  timestamp: string;
}

export default function DatabasePerformanceDashboard() {
  const [data, setData] = useState<DatabasePerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/database-performance');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastRefresh(new Date());
      } else {
        setError(result.message || 'Failed to fetch performance data');
      }
    } catch (err) {
      setError('Failed to fetch performance data');
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceStatus = () => {
    if (!data) return 'unknown';
    
    const slowQueriesCount = data.slowQueries.length;
    const avgQueryTime = data.slowQueries.reduce((acc, q) => acc + q.mean_time, 0) / data.slowQueries.length || 0;
    
    if (slowQueriesCount === 0 && avgQueryTime < 1000) return 'excellent';
    if (slowQueriesCount < 5 && avgQueryTime < 2000) return 'good';
    if (slowQueriesCount < 10 && avgQueryTime < 5000) return 'fair';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <TrendingUp className="h-4 w-4" />;
      case 'fair': return <AlertTriangle className="h-4 w-4" />;
      case 'poor': return <AlertTriangle className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading performance data...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>No performance data available</AlertDescription>
      </Alert>
    );
  }

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor database performance and optimization metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(performanceStatus)}>
            {getStatusIcon(performanceStatus)}
            <span className="ml-1 capitalize">{performanceStatus}</span>
          </Badge>
          <Button onClick={fetchPerformanceData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastRefresh.toLocaleString()}
        </p>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queries">Slow Queries</TabsTrigger>
          <TabsTrigger value="tables">Table Sizes</TabsTrigger>
          <TabsTrigger value="indexes">Index Usage</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.slowQueries.length}</div>
                <p className="text-xs text-muted-foreground">
                  Queries taking &gt; 1s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.tableSizes.length}</div>
                <p className="text-xs text-muted-foreground">
                  Database tables
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.connectionStats.find(c => c.state === 'active')?.connections || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current connections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.queryStats.length > 0 
                    ? `${((data.queryStats[0].blks_hit / (data.queryStats[0].blks_hit + data.queryStats[0].blks_read)) * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Buffer cache efficiency
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slow Queries</CardTitle>
              <CardDescription>
                Queries taking more than 1 second to execute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Total Time</TableHead>
                    <TableHead>Mean Time</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Hit %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slowQueries.map((query, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs max-w-md truncate">
                        {query.query.substring(0, 100)}...
                      </TableCell>
                      <TableCell>{query.calls}</TableCell>
                      <TableCell>{formatTime(query.total_time)}</TableCell>
                      <TableCell>{formatTime(query.mean_time)}</TableCell>
                      <TableCell>{query.rows}</TableCell>
                      <TableCell>{query.hit_percent?.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Sizes</CardTitle>
              <CardDescription>
                Database table sizes in descending order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Size (Bytes)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.tableSizes.map((table, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{table.tablename}</TableCell>
                      <TableCell>{table.size}</TableCell>
                      <TableCell>{formatBytes(table.size_bytes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Index Usage</CardTitle>
              <CardDescription>
                Most frequently used indexes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table</TableHead>
                    <TableHead>Index</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Tuples Read</TableHead>
                    <TableHead>Tuples Fetched</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.indexUsage.map((index, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono">{index.tablename}</TableCell>
                      <TableCell className="font-mono">{index.indexname}</TableCell>
                      <TableCell>{index.idx_scan}</TableCell>
                      <TableCell>{index.idx_tup_read}</TableCell>
                      <TableCell>{index.idx_tup_fetch}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Statistics</CardTitle>
              <CardDescription>
                Current database connections by state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>Connections</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.connectionStats.map((conn, index) => (
                    <TableRow key={index}>
                      <TableCell>{conn.state}</TableCell>
                      <TableCell>{conn.connections}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
