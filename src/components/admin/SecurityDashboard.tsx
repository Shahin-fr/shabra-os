'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Activity, 
  Lock, 
  Unlock, 
  Ban,
  Eye
} from 'lucide-react';

interface SecurityOverview {
  totalEvents: number;
  criticalEvents: number;
  blockedIPs: number;
  lockedAccounts: number;
  recentEvents: any[];
  riskDistribution: Record<string, number>;
}

interface BruteForceStats {
  totalAttempts: number;
  lockedAccounts: number;
  topOffenders: Array<{ identifier: string; attempts: number }>;
}

interface AuditLog {
  id: string;
  eventType: string;
  details: string;
  riskLevel: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

export default function SecurityDashboard() {
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [bruteForceStats, setBruteForceStats] = useState<BruteForceStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters for audit logs
  const [filters, setFilters] = useState({
    eventType: '',
    riskLevel: '',
    limit: '50'
  });

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const fetchSecurityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, bruteForceRes, auditLogsRes] = await Promise.all([
        fetch('/api/admin/security/overview'),
        fetch('/api/admin/security/brute-force'),
        fetch(`/api/admin/security/audit-logs?${new URLSearchParams(filters)}`)
      ]);

      if (!overviewRes.ok || !bruteForceRes.ok || !auditLogsRes.ok) {
        throw new Error('Failed to fetch security data');
      }

      const [overviewData, bruteForceData, auditLogsData] = await Promise.all([
        overviewRes.json(),
        bruteForceRes.json(),
        auditLogsRes.json()
      ]);

      setOverview(overviewData);
      setBruteForceStats(bruteForceData);
      setAuditLogs(auditLogsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleSecurityAction = async (action: string, identifier: string) => {
    try {
      setActionLoading(identifier);
      
      const response = await fetch('/api/admin/security/brute-force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, identifier })
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      // Refresh data
      await fetchSecurityData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
        <Button onClick={fetchSecurityData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{overview.criticalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
              <Ban className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{overview.blockedIPs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locked Accounts</CardTitle>
              <Lock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{overview.lockedAccounts}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="brute-force" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brute-force">Brute Force Protection</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="brute-force" className="space-y-4">
          {bruteForceStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Brute Force Statistics</CardTitle>
                  <CardDescription>Current brute force protection status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Attempts:</span>
                    <Badge variant="outline">{bruteForceStats.totalAttempts}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Locked Accounts:</span>
                    <Badge variant="destructive">{bruteForceStats.lockedAccounts}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Offenders</CardTitle>
                  <CardDescription>IPs with most failed attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bruteForceStats.topOffenders.slice(0, 5).map((offender, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-mono text-sm">{offender.identifier}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{offender.attempts} attempts</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSecurityAction('unlock', offender.identifier)}
                            disabled={actionLoading === offender.identifier}
                          >
                            <Unlock className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSecurityAction('block_ip', offender.identifier)}
                            disabled={actionLoading === offender.identifier}
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Security events and system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Input
                      id="eventType"
                      value={filters.eventType}
                      onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                      placeholder="Filter by event type"
                    />
                  </div>
                  <div>
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Input
                      id="riskLevel"
                      value={filters.riskLevel}
                      onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                      placeholder="Filter by risk level"
                    />
                  </div>
                  <div>
                    <Label htmlFor="limit">Limit</Label>
                    <Input
                      id="limit"
                      value={filters.limit}
                      onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                      placeholder="Number of logs"
                    />
                  </div>
                </div>

                <Button onClick={fetchSecurityData} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>

                {/* Audit Logs Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatTimestamp(log.timestamp)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              <Badge variant="outline">{log.eventType}</Badge>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <Badge 
                                className={`text-white ${getRiskLevelColor(log.riskLevel)}`}
                              >
                                {log.riskLevel}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {log.userId || 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                              {log.ip || 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              <div className="max-w-xs truncate">
                                {JSON.parse(log.details || '{}').reason || 'N/A'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
