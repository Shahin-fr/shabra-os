'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Inbox,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Eye,
  Loader2,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Request {
  id: string;
  type: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details: any;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    roles: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ActionCenterData {
  requests: Request[];
  subordinates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  stats: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
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

export function ActionCenterDashboard() {
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'PENDING',
    employeeId: 'all',
  });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [actionData, setActionData] = useState({
    action: 'APPROVE' as 'APPROVE' | 'REJECT',
    rejectionReason: '',
  });

  const queryClient = useQueryClient();

  // Fetch action center data
  const {
    data: actionCenterData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['action-center', filters.type, filters.status, filters.employeeId],
    queryFn: async (): Promise<ActionCenterData> => {
      const params = new URLSearchParams({
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.employeeId !== 'all' && { employeeId: filters.employeeId }),
      });

      const response = await fetch(`/api/admin/action-center?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch action center data');
      }
      return response.json();
    },
    retry: 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Process request action mutation
  const processActionMutation = useMutation({
    mutationFn: async ({ requestId, action, rejectionReason }: {
      requestId: string;
      action: 'APPROVE' | 'REJECT';
      rejectionReason?: string;
    }) => {
      const response = await fetch(`/api/admin/action-center/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          rejectionReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process request');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-center'] });
      setIsDetailsOpen(false);
      setSelectedRequest(null);
      setActionData({ action: 'APPROVE', rejectionReason: '' });
      toast.success('درخواست با موفقیت پردازش شد');
    },
    onError: (error: Error) => {
      toast.error(`خطا در پردازش درخواست: ${error.message}`);
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleProcessAction = () => {
    if (!selectedRequest) return;

    if (actionData.action === 'REJECT' && !actionData.rejectionReason.trim()) {
      toast.error('لطفاً دلیل رد درخواست را وارد کنید');
      return;
    }

    processActionMutation.mutate({
      requestId: selectedRequest.id,
      action: actionData.action,
      rejectionReason: actionData.action === 'REJECT' ? actionData.rejectionReason : undefined,
    });
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
            خطا در بارگذاری داده‌ها
          </h3>
          <p className='text-gray-600 text-center mb-4'>
            متأسفانه خطایی در بارگذاری مرکز اقدامات رخ داده است.
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
      {/* Statistics Cards */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">کل درخواست‌ها</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {actionCenterData?.stats.total || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">در انتظار</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {actionCenterData?.stats.byStatus.PENDING || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">تأیید شده</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {actionCenterData?.stats.byStatus.APPROVED || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">رد شده</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {actionCenterData?.stats.byStatus.REJECTED || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </OptimizedMotion>

      {/* Filters */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#ff0a54]" />
              فیلترها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">نوع درخواست</Label>
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
                <Label htmlFor="status">وضعیت</Label>
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

              <div className="space-y-2">
                <Label htmlFor="employee">کارمند</Label>
                <Select
                  value={filters.employeeId}
                  onValueChange={(value) => handleFilterChange('employeeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب کارمند" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه کارمندان</SelectItem>
                    {actionCenterData?.subordinates.map((employee) => (
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

      {/* Requests Table */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>درخواست‌ها</CardTitle>
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
            ) : actionCenterData?.requests.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">هیچ درخواستی یافت نشد</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کارمند</TableHead>
                    <TableHead>نوع درخواست</TableHead>
                    <TableHead>خلاصه</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionCenterData?.requests.map((request) => {
                    const IconComponent = REQUEST_TYPE_ICONS[request.type];
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {request.user.firstName} {request.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
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
                          <Button
                            onClick={() => handleViewDetails(request)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            مشاهده
                          </Button>
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

      {/* Request Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>جزئیات درخواست</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">کارمند</Label>
                  <p className="text-lg">
                    {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">نوع درخواست</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const IconComponent = REQUEST_TYPE_ICONS[selectedRequest.type];
                      return <IconComponent className="h-4 w-4 text-gray-600" />;
                    })()}
                    <span>{REQUEST_TYPE_LABELS[selectedRequest.type]}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">وضعیت</Label>
                  <div className="mt-1">
                    <Badge className={STATUS_COLORS[selectedRequest.status]}>
                      {STATUS_LABELS[selectedRequest.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">تاریخ درخواست</Label>
                  <p className="text-lg">{formatDate(selectedRequest.createdAt)}</p>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <Label className="text-sm font-medium text-gray-500">جزئیات درخواست</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedRequest.details, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label className="text-sm font-medium text-gray-500">دلیل درخواست</Label>
                <p className="mt-1 text-sm">{selectedRequest.reason}</p>
              </div>

              {/* Action Buttons (only for pending requests) */}
              {selectedRequest.status === 'PENDING' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">اقدام</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => setActionData(prev => ({ ...prev, action: 'APPROVE' }))}
                        variant={actionData.action === 'APPROVE' ? 'default' : 'outline'}
                        className={actionData.action === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        تأیید
                      </Button>
                      <Button
                        onClick={() => setActionData(prev => ({ ...prev, action: 'REJECT' }))}
                        variant={actionData.action === 'REJECT' ? 'default' : 'outline'}
                        className={actionData.action === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        رد
                      </Button>
                    </div>
                  </div>

                  {actionData.action === 'REJECT' && (
                    <div>
                      <Label htmlFor="rejectionReason">دلیل رد درخواست</Label>
                      <Textarea
                        id="rejectionReason"
                        value={actionData.rejectionReason}
                        onChange={(e) => setActionData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                        placeholder="لطفاً دلیل رد درخواست را وارد کنید..."
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      لغو
                    </Button>
                    <Button
                      onClick={handleProcessAction}
                      disabled={processActionMutation.isPending}
                      className={
                        actionData.action === 'APPROVE'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }
                    >
                      {processActionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : actionData.action === 'APPROVE' ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      {actionData.action === 'APPROVE' ? 'تأیید درخواست' : 'رد درخواست'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
