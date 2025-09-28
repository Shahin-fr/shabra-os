'use client';

import { useQuery } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  // Users,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  RefreshCw,
  AlertCircle,
  Calendar,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApproveLeaveModal } from './ApproveLeaveModal';
import { RejectLeaveModal } from './RejectLeaveModal';

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  thisWeek: number;
}

const leaveTypeLabels: Record<string, string> = {
  ANNUAL: 'مرخصی سالانه',
  SICK: 'مرخصی استعلاجی',
  UNPAID: 'مرخصی بدون حقوق',
  EMERGENCY: 'مرخصی اضطراری',
  MATERNITY: 'مرخصی زایمان',
  PATERNITY: 'مرخصی پدری',
  STUDY: 'مرخصی تحصیلی',
  OTHER: 'سایر',
};

export function AdminLeaveManagement() {
  const [filters, setFilters] = useState({
    status: 'all',
    leaveType: 'all',
    employeeId: 'all',
  });
  const [approvingRequest, setApprovingRequest] = useState<LeaveRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<LeaveRequest | null>(null);

  // Fetch leave requests
  const {
    data: leaveRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-leave-requests', filters],
    queryFn: async (): Promise<LeaveRequest[]> => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.leaveType && filters.leaveType !== 'all') params.append('leaveType', filters.leaveType);
      if (filters.employeeId && filters.employeeId !== 'all') params.append('employeeId', filters.employeeId);

      const response = await fetch(`/api/admin/leave-requests?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }
      const result = await response.json();
      return result.data || [];
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch employees for filter
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const result = await response.json();
      return result.data || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate stats
  const stats: LeaveStats = {
    total: leaveRequests?.length || 0,
    pending: leaveRequests?.filter(r => r.status === 'PENDING').length || 0,
    approved: leaveRequests?.filter(r => r.status === 'APPROVED').length || 0,
    rejected: leaveRequests?.filter(r => r.status === 'REJECTED').length || 0,
    thisWeek: leaveRequests?.filter(r => {
      const requestDate = new Date(r.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return requestDate >= weekAgo;
    }).length || 0,
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    refetch();
    toast.success('داده‌ها بروزرسانی شدند');
  };

  const handleApprove = (request: LeaveRequest) => {
    setApprovingRequest(request);
  };

  const handleReject = (request: LeaveRequest) => {
    setRejectingRequest(request);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            <Clock className='h-3 w-3 me-1' />
            در انتظار
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className='bg-green-100 text-green-800 border-green-200'>
            <CheckCircle className='h-3 w-3 me-1' />
            تایید شده
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>
            <XCircle className='h-3 w-3 me-1' />
            رد شده
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className='bg-gray-100 text-gray-800 border-gray-200'>
            <XCircle className='h-3 w-3 me-1' />
            لغو شده
          </Badge>
        );
      default:
        return (
          <Badge variant='secondary'>
            نامشخص
          </Badge>
        );
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            خطا در بارگذاری درخواست‌ها
          </h3>
          <p className='text-gray-600 text-center mb-4'>
            متأسفانه خطایی در بارگذاری درخواست‌های مرخصی رخ داده است.
          </p>
          <Button onClick={handleRefresh} variant='outline'>
            <RefreshCw className='h-4 w-4 me-2' />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>کل درخواست‌ها</CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.total}</div>
              <p className='text-xs text-muted-foreground'>درخواست مرخصی</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>در انتظار</CardTitle>
              <Clock className='h-4 w-4 text-yellow-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>{stats.pending}</div>
              <p className='text-xs text-muted-foreground'>نیاز به بررسی</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>تایید شده</CardTitle>
              <CheckCircle className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>{stats.approved}</div>
              <p className='text-xs text-muted-foreground'>تایید شده</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>رد شده</CardTitle>
              <XCircle className='h-4 w-4 text-red-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>{stats.rejected}</div>
              <p className='text-xs text-muted-foreground'>رد شده</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>این هفته</CardTitle>
              <Calendar className='h-4 w-4 text-blue-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>{stats.thisWeek}</div>
              <p className='text-xs text-muted-foreground'>درخواست جدید</p>
            </CardContent>
          </Card>
        </div>
      </OptimizedMotion>

      {/* Filters */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='h-5 w-5 text-[#ff0a54]' />
              فیلترها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='status'>وضعیت</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-full justify-end text-right">
                    <SelectValue placeholder='انتخاب وضعیت' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>همه وضعیت‌ها</SelectItem>
                    <SelectItem value='PENDING'>در انتظار</SelectItem>
                    <SelectItem value='APPROVED'>تایید شده</SelectItem>
                    <SelectItem value='REJECTED'>رد شده</SelectItem>
                    <SelectItem value='CANCELLED'>لغو شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='leaveType'>نوع مرخصی</Label>
                <Select
                  value={filters.leaveType}
                  onValueChange={(value) => handleFilterChange('leaveType', value)}
                >
                  <SelectTrigger className="w-full justify-end text-right">
                    <SelectValue placeholder='انتخاب نوع مرخصی' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>همه انواع</SelectItem>
                    {Object.entries(leaveTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='employee'>کارمند</Label>
                <Select
                  value={filters.employeeId}
                  onValueChange={(value) => handleFilterChange('employeeId', value)}
                >
                  <SelectTrigger className="w-full justify-end text-right">
                    <SelectValue placeholder='انتخاب کارمند' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>همه کارمندان</SelectItem>
                    {employees?.map((employee: any) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Leave Requests Table */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5 text-[#ff0a54]' />
                درخواست‌های مرخصی
              </CardTitle>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant='outline'
                size='sm'
              >
                <RefreshCw className={`h-4 w-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
                بروزرسانی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <div className='w-8 h-8 border-2 border-[#ff0a54] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
                  <p className='text-gray-600'>در حال بارگذاری درخواست‌ها...</p>
                </div>
              </div>
            ) : !leaveRequests || leaveRequests.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12'>
                <FileText className='h-12 w-12 text-gray-400 mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  هیچ درخواست مرخصی یافت نشد
                </h3>
                <p className='text-gray-600 text-center'>
                  با فیلترهای انتخاب شده هیچ درخواست مرخصی وجود ندارد.
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>کارمند</TableHead>
                      <TableHead>نوع مرخصی</TableHead>
                      <TableHead>تاریخ‌ها</TableHead>
                      <TableHead>مدت</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>تاریخ ارسال</TableHead>
                      <TableHead className='w-32'>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((request, index) => (
                      <OptimizedMotion
                        key={request.id}
                        as="tr"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className='hover:bg-gray-50'
                      >
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                                <User className='h-4 w-4 text-gray-600' />
                              </div>
                              <div>
                                <p className='font-medium text-gray-900'>
                                  {request.user.firstName} {request.user.lastName}
                                </p>
                                <p className='text-sm text-gray-500'>{request.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className='font-medium'>
                              {leaveTypeLabels[request.leaveType] || request.leaveType}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-1'>
                              <div className='flex items-center gap-2 text-sm'>
                                <Calendar className='h-3 w-3 text-green-600' />
                                <span>شروع: {formatDate(request.startDate)}</span>
                              </div>
                              <div className='flex items-center gap-2 text-sm'>
                                <Calendar className='h-3 w-3 text-red-600' />
                                <span>پایان: {formatDate(request.endDate)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className='font-mono text-sm'>
                              {calculateDays(request.startDate, request.endDate)} روز
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>
                            <span className='text-sm text-gray-600'>
                              {formatDate(request.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {request.status === 'PENDING' && (
                              <div className='flex gap-2'>
                                <Button
                                  onClick={() => handleApprove(request)}
                                  size='sm'
                                  className='bg-green-600 hover:bg-green-700 text-white'
                                >
                                  <CheckCircle className='h-3 w-3 me-1' />
                                  تایید
                                </Button>
                                <Button
                                  onClick={() => handleReject(request)}
                                  size='sm'
                                  variant='destructive'
                                >
                                  <XCircle className='h-3 w-3 me-1' />
                                  رد
                                </Button>
                              </div>
                            )}
                          </TableCell>
                      </OptimizedMotion>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Modals */}
      {approvingRequest && (
        <ApproveLeaveModal
          request={approvingRequest}
          isOpen={!!approvingRequest}
          onClose={() => setApprovingRequest(null)}
        />
      )}

      {rejectingRequest && (
        <RejectLeaveModal
          request={rejectingRequest}
          isOpen={!!rejectingRequest}
          onClose={() => setRejectingRequest(null)}
        />
      )}
    </div>
  );
}
