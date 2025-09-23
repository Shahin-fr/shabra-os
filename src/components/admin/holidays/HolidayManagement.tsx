'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Holiday {
  id: string;
  name: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
}

interface HolidayFormData {
  name: string;
  date: string;
}

export function HolidayManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    upcoming: 'false',
  });
  const [formData, setFormData] = useState<HolidayFormData>({
    name: '',
    date: '',
  });

  const queryClient = useQueryClient();

  // Fetch holidays
  const {
    data: holidays,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['holidays', filters.year, filters.upcoming],
    queryFn: async (): Promise<Holiday[]> => {
      const params = new URLSearchParams({
        ...(filters.year && { year: filters.year }),
        ...(filters.upcoming === 'true' && { upcoming: 'true' }),
      });

      const response = await fetch(`/api/admin/holidays?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }
      const result = await response.json();
      return result.holidays || [];
    },
    retry: 2,
    staleTime: 2 * 60 * 1000,
  });

  // Create holiday mutation
  const createHolidayMutation = useMutation({
    mutationFn: async (data: HolidayFormData) => {
      const response = await fetch('/api/admin/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create holiday');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', date: '' });
      toast.success('تعطیل با موفقیت اضافه شد');
    },
    onError: (error: Error) => {
      toast.error(`خطا در اضافه کردن تعطیل: ${error.message}`);
    },
  });

  // Update holiday mutation
  const updateHolidayMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HolidayFormData> }) => {
      const response = await fetch(`/api/admin/holidays/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update holiday');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setIsEditDialogOpen(false);
      setSelectedHoliday(null);
      setFormData({ name: '', date: '' });
      toast.success('تعطیل با موفقیت به‌روزرسانی شد');
    },
    onError: (error: Error) => {
      toast.error(`خطا در به‌روزرسانی تعطیل: ${error.message}`);
    },
  });

  // Delete holiday mutation
  const deleteHolidayMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/holidays/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete holiday');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('تعطیل با موفقیت حذف شد');
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف تعطیل: ${error.message}`);
    },
  });

  const handleCreateHoliday = () => {
    if (!formData.name || !formData.date) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    createHolidayMutation.mutate(formData);
  };

  const handleEditHoliday = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    const dateString = holiday.date ? new Date(holiday.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setFormData({
      name: holiday.name,
      date: dateString as string,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateHoliday = () => {
    if (!selectedHoliday || !formData.name || !formData.date) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    updateHolidayMutation.mutate({
      id: selectedHoliday.id,
      data: formData,
    });
  };

  const handleDeleteHoliday = (holiday: Holiday) => {
    if (typeof window !== 'undefined' && window.confirm(`آیا از حذف تعطیل "${holiday.name}" اطمینان دارید؟`)) {
      deleteHolidayMutation.mutate(holiday.id);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const getUpcomingHolidays = () => {
    return holidays?.filter(holiday => holiday.date && isUpcoming(holiday.date)) || [];
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <OptimizedMotion
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#ff0a54]/10 rounded-xl">
                  <Calendar className="h-6 w-6 text-[#ff0a54]" />
                </div>
                <div>
                  <CardTitle className="text-xl">مدیریت تعطیلات</CardTitle>
                  <p className="text-gray-600">افزودن، ویرایش و حذف تعطیلات رسمی</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  بروزرسانی
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-[#ff0a54] hover:bg-[#ff0a54]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      افزودن تعطیل
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>افزودن تعطیل جدید</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">نام تعطیل</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="مثال: عید نوروز"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">تاریخ</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          لغو
                        </Button>
                        <Button
                          onClick={handleCreateHoliday}
                          disabled={createHolidayMutation.isPending}
                          className="bg-[#ff0a54] hover:bg-[#ff0a54]/90"
                        >
                          {createHolidayMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          افزودن
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>
      </OptimizedMotion>

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
                <Label htmlFor="year">سال</Label>
                <Select
                  value={filters.year}
                  onValueChange={(value) => handleFilterChange('year', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب سال" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upcoming">نوع نمایش</Label>
                <Select
                  value={filters.upcoming}
                  onValueChange={(value) => handleFilterChange('upcoming', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">همه تعطیلات</SelectItem>
                    <SelectItem value="true">فقط تعطیلات آینده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Statistics */}
      {holidays && (
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">کل تعطیلات</span>
                </div>
                <div className="text-2xl font-bold mt-1">{holidays.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">تعطیلات آینده</span>
                </div>
                <div className="text-2xl font-bold mt-1">{getUpcomingHolidays().length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">تعطیلات گذشته</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {holidays.length - getUpcomingHolidays().length}
                </div>
              </CardContent>
            </Card>
          </div>
        </OptimizedMotion>
      )}

      {/* Holidays Table */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>لیست تعطیلات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
              </div>
            ) : error ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  خطا در بارگذاری تعطیلات. لطفاً دوباره تلاش کنید.
                </AlertDescription>
              </Alert>
            ) : holidays && holidays.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">هیچ تعطیلی یافت نشد</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام تعطیل</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays?.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell>{holiday.date ? formatDate(holiday.date) : 'تاریخ نامشخص'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={holiday.date && isUpcoming(holiday.date) ? "default" : "secondary"}
                          className={
                            holiday.date && isUpcoming(holiday.date)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {holiday.date && isUpcoming(holiday.date) ? "آینده" : "گذشته"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditHoliday(holiday)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteHoliday(holiday)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش تعطیل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">نام تعطیل</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: عید نوروز"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">تاریخ</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                لغو
              </Button>
              <Button
                onClick={handleUpdateHoliday}
                disabled={updateHolidayMutation.isPending}
                className="bg-[#ff0a54] hover:bg-[#ff0a54]/90"
              >
                {updateHolidayMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                به‌روزرسانی
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
