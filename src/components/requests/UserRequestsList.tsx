'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Filter,
  RefreshCw,
  AlertCircle,
  // CheckCircle,
  // XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Request {
  id: string;
  type: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details: any;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const REQUEST_TYPE_LABELS = {
  LEAVE: 'مرخصی',
  OVERTIME: 'اضافه‌کار',
  EXPENSE_CLAIM: 'درخواست هزینه',
  GENERAL: 'عمومی',
};

const REQUEST_TYPE_ICONS = {
  LEAVE: Calendar,
  OVERTIME: Clock,
  EXPENSE_CLAIM: DollarSign,
  GENERAL: FileText,
};

const STATUS_LABELS = {
  PENDING: 'در انتظار',
  APPROVED: 'تأیید شده',
  REJECTED: 'رد شده',
  CANCELLED: 'لغو شده',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export function UserRequestsList() {
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
  });

  // Fetch user requests
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-requests', filters.type, filters.status],
    queryFn: async (): Promise<Request[]> => {
      const params = new URLSearchParams({
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
      });

      const response = await fetch(`/api/requests?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const result = await response.json();
      return result.data || [];
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getRequestSummary = (request: Request) => {
    switch (request.type) {
      case 'LEAVE':
        return `مرخصی ${request.details.leaveType} از ${formatDate(request.details.startDate)} تا ${formatDate(request.details.endDate)}`;
      case 'OVERTIME':
        return `اضافه‌کار در ${formatDate(request.details.date)} از ${request.details.startTime} تا ${request.details.endTime}`;
      case 'EXPENSE_CLAIM':
        return `درخواست هزینه ${request.details.amount} ${request.details.currency} - ${request.details.category}`;
      case 'GENERAL':
        return request.details.subject;
      default:
        return 'درخواست';
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
            متأسفانه خطایی در بارگذاری درخواست‌ها رخ داده است.
          </p>
          <Button onClick={() => refetch()} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#ff0a54]" />
              فیلترها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع درخواست</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه انواع</SelectItem>
                    <SelectItem value="LEAVE">مرخصی</SelectItem>
                    <SelectItem value="OVERTIME">اضافه‌کار</SelectItem>
                    <SelectItem value="EXPENSE_CLAIM">درخواست هزینه</SelectItem>
                    <SelectItem value="GENERAL">عمومی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">وضعیت</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="PENDING">در انتظار</SelectItem>
                    <SelectItem value="APPROVED">تأیید شده</SelectItem>
                    <SelectItem value="REJECTED">رد شده</SelectItem>
                    <SelectItem value="CANCELLED">لغو شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Requests Table */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>درخواست‌های من</CardTitle>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                بروزرسانی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
              </div>
            ) : requests?.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">هیچ درخواستی یافت نشد</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نوع درخواست</TableHead>
                    <TableHead>خلاصه</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>تاریخ ارسال</TableHead>
                    <TableHead>بررسی کننده</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests?.map((request) => {
                    const IconComponent = REQUEST_TYPE_ICONS[request.type];
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                            <span>{REQUEST_TYPE_LABELS[request.type]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {getRequestSummary(request)}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[request.status]}>
                            {STATUS_LABELS[request.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                        <TableCell>
                          {request.reviewer ? (
                            <span>
                              {request.reviewer.firstName} {request.reviewer.lastName}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>
    </div>
  );
}
