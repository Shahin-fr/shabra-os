'use client';

import { useQuery } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

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

export function MyLeaveRequestsTable() {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Fetch leave requests
  const {
    data: leaveRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: async (): Promise<LeaveRequest[]> => {
      const response = await fetch('/api/leave-requests');
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            <Clock className='h-3 w-3 ms-1' />
            در انتظار
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className='bg-green-100 text-green-800 border-green-200'>
            <CheckCircle className='h-3 w-3 ms-1' />
            تایید شده
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>
            <XCircle className='h-3 w-3 ms-1' />
            رد شده
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className='bg-gray-100 text-gray-800 border-gray-200'>
            <XCircle className='h-3 w-3 ms-1' />
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

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
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
          <Button onClick={() => refetch()} variant='outline'>
            <RefreshCw className='h-4 w-4 ms-2' />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header with Refresh Button */}
      <div className='flex justify-between items-center'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            درخواست‌های مرخصی شما
          </h3>
          <p className='text-sm text-gray-600'>
            {leaveRequests?.length || 0} درخواست مرخصی
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isLoading}
          variant='outline'
          size='sm'
        >
          <RefreshCw className={`h-4 w-4 ms-2 ${isLoading ? 'animate-spin' : ''}`} />
          بروزرسانی
        </Button>
      </div>

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
            هنوز هیچ درخواست مرخصی ارسال نکرده‌اید.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className='hidden md:block overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نوع مرخصی</TableHead>
                  <TableHead>تاریخ شروع</TableHead>
                  <TableHead>تاریخ پایان</TableHead>
                  <TableHead>مدت</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تاریخ ارسال</TableHead>
                  <TableHead className='w-12'></TableHead>
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
                        <div className='flex items-center gap-2'>
                          <FileText className='h-4 w-4 text-gray-400' />
                          <span className='font-medium'>
                            {leaveTypeLabels[request.leaveType] || request.leaveType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-green-600' />
                          <span className='text-sm'>{formatDate(request.startDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-red-600' />
                          <span className='text-sm'>{formatDate(request.endDate)}</span>
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
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                  </OptimizedMotion>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className='md:hidden space-y-4'>
            {leaveRequests.map((request, index) => (
              <OptimizedMotion
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className='p-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <FileText className='h-4 w-4 text-gray-400' />
                        <span className='font-medium'>
                          {leaveTypeLabels[request.leaveType] || request.leaveType}
                        </span>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      <div>
                        <span className='text-gray-600'>شروع:</span>
                        <div className='flex items-center gap-1 mt-1'>
                          <Calendar className='h-3 w-3 text-green-600' />
                          <span>{formatDate(request.startDate)}</span>
                        </div>
                      </div>
                      <div>
                        <span className='text-gray-600'>پایان:</span>
                        <div className='flex items-center gap-1 mt-1'>
                          <Calendar className='h-3 w-3 text-red-600' />
                          <span>{formatDate(request.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>
                        مدت: {calculateDays(request.startDate, request.endDate)} روز
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className='h-4 w-4 ms-1' />
                        جزئیات
                      </Button>
                    </div>
                  </div>
                </Card>
              </OptimizedMotion>
            ))}
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={handleCloseDetails}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5 text-[#ff0a54]' />
                جزئیات درخواست مرخصی
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-6'>
              {/* Request Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>نوع مرخصی</Label>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-gray-400' />
                    <span>{leaveTypeLabels[selectedRequest.leaveType] || selectedRequest.leaveType}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>وضعیت</Label>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>تاریخ شروع</Label>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-green-600' />
                    <span>{formatDate(selectedRequest.startDate)}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>تاریخ پایان</Label>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-red-600' />
                    <span>{formatDate(selectedRequest.endDate)}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>مدت مرخصی</Label>
                  <span className='font-mono'>
                    {calculateDays(selectedRequest.startDate, selectedRequest.endDate)} روز
                  </span>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>تاریخ ارسال</Label>
                  <span className='text-sm'>{formatDateTime(selectedRequest.createdAt)}</span>
                </div>
              </div>

              {/* Reason */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium text-gray-600'>دلیل مرخصی</Label>
                <div className='p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm'>{selectedRequest.reason}</p>
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedRequest.status === 'REJECTED' && selectedRequest.rejectionReason && (
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-red-600'>دلیل رد درخواست</Label>
                  <div className='p-3 bg-red-50 rounded-lg border border-red-200'>
                    <p className='text-sm text-red-800'>{selectedRequest.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Review Info */}
              {selectedRequest.reviewedAt && (
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>اطلاعات بررسی</Label>
                  <div className='p-3 bg-blue-50 rounded-lg'>
                    <p className='text-sm'>
                      بررسی شده در: {formatDateTime(selectedRequest.reviewedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className='flex justify-end rtl:justify-start pt-4'>
              <Button onClick={handleCloseDetails} variant='outline'>
                بستن
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
