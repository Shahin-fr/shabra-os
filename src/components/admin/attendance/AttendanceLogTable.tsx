'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditAttendanceModal } from './EditAttendanceModal';
import { DeleteAttendanceModal } from './DeleteAttendanceModal';

interface AttendanceRecord {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string;
  };
  checkIn: string;
  checkOut: string | null;
  totalDuration: string | null;
  status: 'completed' | 'in-progress';
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceLogTableProps {
  filters: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status: string;
  };
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function AttendanceLogTable({
  filters,
  page,
  limit,
  onPageChange,
  className,
}: AttendanceLogTableProps) {
  const queryClient = useQueryClient();
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<AttendanceRecord | null>(null);

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status: filters.status,
  });

  if (filters.employeeId && filters.employeeId !== 'all') {
    queryParams.append('employeeId', filters.employeeId);
  }
  if (filters.startDate) {
    queryParams.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    queryParams.append('endDate', filters.endDate);
  }

  // Fetch attendance records
  const {
    data: attendanceData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-attendance', filters, page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/attendance?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      const result = await response.json();
      return result.data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete attendance record mutation
  const deleteMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const response = await fetch(`/api/admin/attendance/${recordId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete attendance record');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('رکورد حضور با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attendance-stats'] });
      setDeletingRecord(null);
    },
    onError: () => {
      toast.error('خطا در حذف رکورد حضور');
    },
  });

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
  };

  const handleDelete = (record: AttendanceRecord) => {
    setDeletingRecord(record);
  };

  const handleRefresh = () => {
    refetch();
  };

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

  const getStatusBadge = (record: AttendanceRecord) => {
    if (record.status === 'completed') {
      return (
        <Badge className='bg-green-100 text-green-800 border-green-200'>
          <CheckCircle className='h-3 w-3 me-1' />
          تکمیل شده
        </Badge>
      );
    }
    return (
      <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
        <Clock className='h-3 w-3 me-1' />
        در حال انجام
      </Badge>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            خطا در بارگذاری رکوردهای حضور
          </h3>
          <p className='text-gray-600 text-center mb-4'>
            متأسفانه خطایی در بارگذاری رکوردهای حضور رخ داده است.
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
    <div className={className}>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-[#ff0a54]' />
              رکوردهای حضور
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
                <p className='text-gray-600'>در حال بارگذاری رکوردهای حضور...</p>
              </div>
            </div>
          ) : !attendanceData?.records || attendanceData.records.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <Calendar className='h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                هیچ رکورد حضوری یافت نشد
              </h3>
              <p className='text-gray-600 text-center'>
                با فیلترهای انتخاب شده هیچ رکورد حضوری وجود ندارد.
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>کارمند</TableHead>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>ورود</TableHead>
                      <TableHead>خروج</TableHead>
                      <TableHead>مدت کار</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead className='w-12'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.records.map((record: AttendanceRecord, index: number) => (
                      <OptimizedMotion
                        key={record.id}
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
                                  {record.user.firstName} {record.user.lastName}
                                </p>
                                <p className='text-sm text-gray-500'>{record.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4 text-gray-400' />
                              <span className='text-sm'>{formatDate(record.checkIn)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Clock className='h-4 w-4 text-green-600' />
                              <span className='text-sm font-mono'>{formatTime(record.checkIn)}</span>
                              {record.isLate && (
                                <Badge className='bg-red-100 text-red-800 text-xs'>
                                  دیر
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.checkOut ? (
                              <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4 text-red-600' />
                                <span className='text-sm font-mono'>{formatTime(record.checkOut)}</span>
                              </div>
                            ) : (
                              <span className='text-gray-400'>-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.totalDuration ? (
                              <span className='font-mono text-sm'>{record.totalDuration}</span>
                            ) : (
                              <span className='text-gray-400'>-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(record)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem onClick={() => handleEdit(record)}>
                                  <Edit className='h-4 w-4 me-2' />
                                  ویرایش
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(record)}
                                  className='text-red-600'
                                >
                                  <Trash2 className='h-4 w-4 me-2' />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                      </OptimizedMotion>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {attendanceData.pagination && attendanceData.pagination.totalPages > 1 && (
                <div className='flex items-center justify-between mt-6'>
                  <div className='text-sm text-gray-600'>
                    نمایش {((page - 1) * limit) + 1} تا {Math.min(page * limit, attendanceData.pagination.totalCount)} از {attendanceData.pagination.totalCount} رکورد
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onPageChange(page - 1)}
                      disabled={!attendanceData.pagination.hasPrevPage}
                    >
                      <ChevronLeft className="rtl:rotate-180 h-4 w-4" />
                      قبلی
                    </Button>
                    <div className='flex items-center gap-1'>
                      {Array.from({ length: Math.min(5, attendanceData.pagination.totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? 'default' : 'outline'}
                            size='sm'
                            onClick={() => onPageChange(pageNum)}
                            className='w-8 h-8 p-0'
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onPageChange(page + 1)}
                      disabled={!attendanceData.pagination.hasNextPage}
                    >
                      بعدی
                      <ChevronRight className="rtl:rotate-180 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingRecord && (
        <EditAttendanceModal
          record={editingRecord}
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}

      {/* Delete Modal */}
      {deletingRecord && (
        <DeleteAttendanceModal
          record={deletingRecord}
          isOpen={!!deletingRecord}
          onClose={() => setDeletingRecord(null)}
          onConfirm={() => deleteMutation.mutate(deletingRecord.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
