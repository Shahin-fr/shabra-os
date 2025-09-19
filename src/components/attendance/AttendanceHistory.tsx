'use client';

import { useQuery } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  Clock, 
  // Calendar, 
  // CheckCircle, 
  AlertCircle,
  RefreshCw,
  // TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';

export function AttendanceHistory() {
  const { user } = useAuth();

  // Fetch attendance data
  const {
    data: attendanceData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['attendance-history', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/attendance?userId=${user?.id}&limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return null;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours} ساعت و ${diffMinutes} دقیقه`;
  };

  const getStatusBadge = (checkOut?: string) => {
    if (checkOut) {
      return <Badge variant="default" className="bg-green-100 text-green-800">تکمیل شده</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-600">در حال کار</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
          <p className="text-gray-500">در حال بارگذاری سابقه حضور...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <p className="text-red-600 mb-4">خطا در بارگذاری سابقه حضور</p>
          <Button onClick={() => refetch()} variant="outline">
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!attendanceData || attendanceData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">هیچ سابقه حضوری یافت نشد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            سابقه حضور
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {attendanceData.length}
              </div>
              <div className="text-sm text-gray-600">کل روزهای حضور</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(Array.isArray(attendanceData) ? attendanceData : []).filter((record: any) => record.checkOut).length}
              </div>
              <div className="text-sm text-gray-600">روزهای تکمیل شده</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {(Array.isArray(attendanceData) ? attendanceData : []).filter((record: any) => !record.checkOut).length}
              </div>
              <div className="text-sm text-gray-600">روزهای در حال کار</div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>ساعت ورود</TableHead>
                  <TableHead>ساعت خروج</TableHead>
                  <TableHead>مدت کار</TableHead>
                  <TableHead>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Array.isArray(attendanceData) ? attendanceData : []).map((record: any, index: number) => (
                  <OptimizedMotion
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {formatDate(record.checkIn)}
                      </TableCell>
                      <TableCell>
                        {formatTime(record.checkIn)}
                      </TableCell>
                      <TableCell>
                        {record.checkOut ? formatTime(record.checkOut) : '-'}
                      </TableCell>
                      <TableCell>
                        {calculateDuration(record.checkIn, record.checkOut) || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.checkOut)}
                      </TableCell>
                    </TableRow>
                  </OptimizedMotion>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {(Array.isArray(attendanceData) ? attendanceData : []).map((record: any, index: number) => (
              <OptimizedMotion
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      {formatDate(record.checkIn)}
                    </div>
                    {getStatusBadge(record.checkOut)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">ورود:</span> {formatTime(record.checkIn)}
                    </div>
                    <div>
                      <span className="font-medium">خروج:</span> {record.checkOut ? formatTime(record.checkOut) : '-'}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">مدت کار:</span> {calculateDuration(record.checkIn, record.checkOut) || '-'}
                    </div>
                  </div>
                </div>
              </OptimizedMotion>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
