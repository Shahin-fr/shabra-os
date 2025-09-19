'use client';

import { useQuery } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MyLeaveRequestsTable } from '@/components/leave/MyLeaveRequestsTable';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';

import { CompleteProfileData } from '@/types/profile';

interface ProfileHRInfoProps {
  profileData: CompleteProfileData;
}

export function ProfileHRInfo({ profileData }: ProfileHRInfoProps) {
  // Fetch detailed attendance data
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ['attendance', profileData.user.id],
    queryFn: async () => {
      const response = await fetch(`/api/attendance?userId=${profileData.user.id}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      const result = await response.json();
      return result.data || [];
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch detailed leave requests
  const {
    data: leaveRequests,
    isLoading: leaveLoading,
    refetch: refetchLeave,
  } = useQuery({
    queryKey: ['leave-requests', profileData.user.id],
    queryFn: async () => {
      const response = await fetch(`/api/leave-requests?userId=${profileData.user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }
      const result = await response.json();
      return result.data || [];
    },
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

  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600">در انتظار</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">تایید شده</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">رد شده</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary">لغو شده</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      ANNUAL: 'مرخصی سالانه',
      SICK: 'مرخصی استعلاجی',
      UNPAID: 'مرخصی بدون حقوق',
      EMERGENCY: 'مرخصی اضطراری',
      MATERNITY: 'مرخصی زایمان',
      PATERNITY: 'مرخصی پدری',
      STUDY: 'مرخصی تحصیلی',
      OTHER: 'سایر',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* HR Summary */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              خلاصه منابع انسانی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Attendance */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {profileData.performance.attendanceCount}
                </div>
                <div className="text-sm text-gray-600">روزهای حضور (30 روز گذشته)</div>
              </div>

              {/* Leave Requests */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {profileData.performance.leaveCounts.PENDING}
                </div>
                <div className="text-sm text-gray-600">درخواست‌های در انتظار</div>
              </div>

              {/* Approved Leaves */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {profileData.performance.leaveCounts.APPROVED}
                </div>
                <div className="text-sm text-gray-600">مرخصی‌های تایید شده</div>
              </div>

              {/* Rejected Leaves */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {profileData.performance.leaveCounts.REJECTED}
                </div>
                <div className="text-sm text-gray-600">مرخصی‌های رد شده</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Recent Attendance */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                سابقه حضور اخیر
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchAttendance()}
                disabled={attendanceLoading}
              >
                <RefreshCw className={`h-4 w-4 me-2 ${attendanceLoading ? 'animate-spin' : ''}`} />
                بروزرسانی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
                <p className="text-gray-500">در حال بارگذاری...</p>
              </div>
            ) : attendanceData && attendanceData.length > 0 ? (
              <div className="space-y-3">
                {attendanceData.slice(0, 5).map((record: any) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {formatDate(record.checkIn)}
                        </div>
                        <div className="text-sm text-gray-600">
                          ورود: {formatTime(record.checkIn)}
                          {record.checkOut && ` - خروج: ${formatTime(record.checkOut)}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      {record.checkOut ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          تکمیل شده
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600">
                          در حال کار
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>هیچ سابقه حضوری یافت نشد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Leave Requests */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                درخواست‌های مرخصی
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchLeave()}
                disabled={leaveLoading}
              >
                <RefreshCw className={`h-4 w-4 me-2 ${leaveLoading ? 'animate-spin' : ''}`} />
                بروزرسانی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {leaveLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
                <p className="text-gray-500">در حال بارگذاری...</p>
              </div>
            ) : leaveRequests && leaveRequests.length > 0 ? (
              <div className="space-y-3">
                {leaveRequests.slice(0, 5).map((request: any) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">
                          {getLeaveTypeLabel(request.leaveType)}
                        </h3>
                        {getLeaveStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </div>
                      {request.reason && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {request.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>هیچ درخواست مرخصی یافت نشد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Detailed Tables - Only show if there's data */}
      {(profileData.performance.leaveCounts.PENDING > 0 || 
        profileData.performance.leaveCounts.APPROVED > 0 || 
        profileData.performance.leaveCounts.REJECTED > 0) && (
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <MyLeaveRequestsTable />
        </OptimizedMotion>
      )}

      {profileData.performance.attendanceCount > 0 && (
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <AttendanceHistory />
        </OptimizedMotion>
      )}
    </div>
  );
}
