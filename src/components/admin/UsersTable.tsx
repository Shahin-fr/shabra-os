'use client';

import { useQuery } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  Users, 
  Mail, 
  Shield, 
  User as UserIcon, 
  Calendar, 
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AnimatedTableRow } from '@/components/ui/AnimatedTableRow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types/hr';

// User interface is now imported from shared types

interface UsersTableProps {
  className?: string;
}

export function UsersTable({ className }: UsersTableProps) {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const result = await response.json();
      return result.data || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className='h-4 w-4 text-red-600' />;
      case 'MANAGER':
        return <Shield className='h-4 w-4 text-orange-600' />;
      case 'EMPLOYEE':
        return <UserIcon className='h-4 w-4 text-blue-600' />;
      default:
        return <UserIcon className='h-4 w-4 text-gray-600' />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'مدیر کل';
      case 'MANAGER':
        return 'مدیر';
      case 'EMPLOYEE':
        return 'کارمند';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EMPLOYEE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  // Calculate stats
  const stats = {
    total: users.length,
    admins: users.filter(user => user.roles === 'ADMIN').length,
    managers: users.filter(user => user.roles === 'MANAGER').length,
    employees: users.filter(user => user.roles === 'EMPLOYEE').length,
    active: users.filter(user => user.isActive).length,
    inactive: users.filter(user => !user.isActive).length,
  };

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            خطا در بارگذاری کاربران
          </h3>
          <p className='text-gray-600 text-center mb-4'>
            متأسفانه خطایی در بارگذاری لیست کاربران رخ داده است.
          </p>
          <Button onClick={handleRefresh} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Stats Cards */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'
      >
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>کل کاربران</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
              </div>
              <Users className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>مدیران</p>
                <p className='text-2xl font-bold text-red-600'>{stats.admins}</p>
              </div>
              <Shield className='h-8 w-8 text-red-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>کارمندان</p>
                <p className='text-2xl font-bold text-blue-600'>{stats.employees}</p>
              </div>
              <UserIcon className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>فعال</p>
                <p className='text-2xl font-bold text-green-600'>{stats.active}</p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Users Table */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-[#ff0a54]' />
                لیست کاربران
              </CardTitle>
              <Button
                onClick={handleRefresh}
                disabled={refreshing || isLoading}
                variant='outline'
                size='sm'
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                بروزرسانی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <div className='w-8 h-8 border-2 border-[#ff0a54] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
                  <p className='text-gray-600'>در حال بارگذاری کاربران...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12'>
                <Users className='h-12 w-12 text-gray-400 mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  هیچ کاربری یافت نشد
                </h3>
                <p className='text-gray-600 text-center'>
                  هنوز هیچ کاربری در سیستم ثبت نشده است.
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام</TableHead>
                      <TableHead>ایمیل</TableHead>
                      <TableHead>نقش</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>تاریخ ایجاد</TableHead>
                      <TableHead className='w-12'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <AnimatedTableRow
                        key={user.id}
                        index={index}
                        className='hover:bg-gray-50'
                      >
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                                <UserIcon className='h-4 w-4 text-gray-600' />
                              </div>
                              <div>
                                <p className='font-medium text-gray-900'>
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className='text-sm text-gray-500'>
                                  ID: {user.id.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Mail className='h-4 w-4 text-gray-400' />
                              <span className='text-sm'>{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.roles)}>
                              <div className='flex items-center gap-1'>
                                {getRoleIcon(user.roles)}
                                {getRoleLabel(user.roles)}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              {user.isActive ? (
                                <>
                                  <CheckCircle className='h-4 w-4 text-green-600' />
                                  <span className='text-sm text-green-600'>فعال</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className='h-4 w-4 text-red-600' />
                                  <span className='text-sm text-red-600'>غیرفعال</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4 text-gray-400' />
                              <div className='text-sm'>
                                <p>{formatDate(user.createdAt)}</p>
                                <p className='text-gray-500'>{formatDateTime(user.createdAt)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem>
                                  مشاهده جزئیات
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  ویرایش
                                </DropdownMenuItem>
                                <DropdownMenuItem className='text-red-600'>
                                  غیرفعال کردن
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                      </AnimatedTableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>
    </div>
  );
}
