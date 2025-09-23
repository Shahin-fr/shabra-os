'use client';

import { useQuery } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Users,
  Clock,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
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
import { AttendanceLogTable } from './AttendanceLogTable';
import { WorkScheduleManagement } from './WorkScheduleManagement';

interface AttendanceStats {
  today: {
    totalEmployeesPresent: number;
    totalHoursLogged: number;
    averageClockInTime: string;
    currentlyClockedIn: number;
    attendanceRate: number;
  };
  week: {
    totalHoursLogged: number;
    totalRecords: number;
  };
  overall: {
    totalEmployees: number;
    activeEmployees: number;
  };
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
}

export function AdminAttendanceDashboard() {
  const [filters, setFilters] = useState({
    employeeId: 'all',
    startDate: '',
    endDate: '',
    status: 'all',
  });
  const [page, setPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'attendance' | 'work-schedule'>('attendance');

  // Fetch attendance statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin-attendance-stats'],
    queryFn: async (): Promise<AttendanceStats> => {
      const response = await fetch('/api/admin/attendance/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch attendance stats');
      }
      const result = await response.json();
      return result.data;
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch employees for filter dropdown
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<Employee[]> => {
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleApplyFilters = () => {
    setIsFiltersOpen(false);
    setPage(1);
    toast.success('فیلترها اعمال شدند');
  };

  const handleClearFilters = () => {
    setFilters({
      employeeId: '',
      startDate: '',
      endDate: '',
      status: 'all',
    });
    setPage(1);
    toast.success('فیلترها پاک شدند');
  };

  const handleRefresh = () => {
    refetchStats();
    toast.success('داده‌ها بروزرسانی شدند');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('قابلیت صادرات در حال توسعه است');
  };

  if (statsError) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            خطا در بارگذاری آمار
          </h3>
          <p className='text-gray-600 text-center mb-4'>
            متأسفانه خطایی در بارگذاری آمار حضور رخ داده است.
          </p>
          <Button onClick={handleRefresh} variant='outline' icon={<RefreshCw className='h-4 w-4' />}>
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Tab Navigation */}
      <OptimizedMotion
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="flex border-b">
              <Button
                onClick={() => setActiveTab('attendance')}
                variant={activeTab === 'attendance' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Calendar className="h-4 w-4" />
                حضور و غیاب
              </Button>
              <Button
                onClick={() => setActiveTab('work-schedule')}
                variant={activeTab === 'work-schedule' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Clock className="h-4 w-4" />
                برنامه کاری
              </Button>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Tab Content */}
      {activeTab === 'attendance' ? (
        <>
          {/* Summary Stats */}
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Total Employees Present */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>کارمندان حاضر</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {statsLoading ? '-' : stats?.today.totalEmployeesPresent || 0}
              </div>
              <p className='text-xs text-muted-foreground'>
                از {stats?.overall.totalEmployees || 0} کارمند کل
              </p>
              <div className='mt-2'>
                <Badge className='bg-green-100 text-green-800'>
                  {stats?.today.attendanceRate || 0}% حضور
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Total Hours Logged Today */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>ساعات کار امروز</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {statsLoading ? '-' : stats?.today.totalHoursLogged.toFixed(1) || 0}
              </div>
              <p className='text-xs text-muted-foreground'>ساعت</p>
              <div className='mt-2'>
                <Badge className='bg-blue-100 text-blue-800'>
                  {stats?.week.totalHoursLogged.toFixed(1) || 0} ساعت این هفته
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Average Clock-in Time */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>میانگین ورود</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold font-mono'>
                {statsLoading ? '-' : stats?.today.averageClockInTime || '00:00'}
              </div>
              <p className='text-xs text-muted-foreground'>امروز</p>
              <div className='mt-2'>
                <Badge className='bg-orange-100 text-orange-800'>
                  {stats?.today.currentlyClockedIn || 0} در حال کار
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>عملیات سریع</CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                variant='outline'
                size='sm'
                className='w-full'
                icon={<Filter className='h-4 w-4' />}
              >
                فیلترها
              </Button>
              <Button
                onClick={handleExport}
                variant='outline'
                size='sm'
                className='w-full'
                icon={<Download className='h-4 w-4' />}
              >
                صادرات
              </Button>
            </CardContent>
          </Card>
        </div>
      </OptimizedMotion>

      {/* Filters Section */}
      {isFiltersOpen && (
        <OptimizedMotion
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5 text-[#ff0a54]' />
                فیلترهای جستجو
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {/* Employee Filter */}
                <div className='space-y-2'>
                  <Label htmlFor='employee'>کارمند</Label>
                  <Select
                    value={filters.employeeId}
                    onValueChange={(value) => handleFilterChange('employeeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='انتخاب کارمند' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>همه کارمندان</SelectItem>
                      {employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date Filter */}
                <div className='space-y-2'>
                  <Label htmlFor='startDate'>از تاریخ</Label>
                  <Input
                    id='startDate'
                    type='date'
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>

                {/* End Date Filter */}
                <div className='space-y-2'>
                  <Label htmlFor='endDate'>تا تاریخ</Label>
                  <Input
                    id='endDate'
                    type='date'
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <div className='space-y-2'>
                  <Label htmlFor='status'>وضعیت</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='انتخاب وضعیت' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>همه</SelectItem>
                      <SelectItem value='present'>حاضر</SelectItem>
                      <SelectItem value='absent'>غایب</SelectItem>
                      <SelectItem value='late'>دیر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className='flex justify-end gap-3 mt-6'>
                <Button
                  onClick={handleClearFilters}
                  variant='outline'
                  size='sm'
                >
                  پاک کردن فیلترها
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  variant='default'
                  size='sm'
                >
                  اعمال فیلترها
                </Button>
              </div>
            </CardContent>
          </Card>
        </OptimizedMotion>
      )}

          {/* Attendance Log Table */}
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AttendanceLogTable
              filters={filters}
              page={page}
              limit={10}
              onPageChange={setPage}
            />
          </OptimizedMotion>
        </>
      ) : (
        <WorkScheduleManagement />
      )}
    </div>
  );
}
