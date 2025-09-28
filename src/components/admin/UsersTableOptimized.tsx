'use client';

import { memo, useCallback } from 'react';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  Users, 
  Mail, 
  Calendar, 
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingState } from '@/components/hr/LoadingState';
import { EmptyState } from '@/components/hr/EmptyState';
import { RoleBadge } from '@/components/hr/RoleBadge';
import { useUsers } from '@/hooks/useHR';
import { User, UserRole } from '@/types/hr';
import { formatDate } from '@/types/hr';

interface UsersTableProps {
  className?: string;
}

// Memoized UserRow component to prevent unnecessary re-renders
const UserRow = memo(({ user, index }: { user: User; index: number }) => {
  // const getRoleIcon = useCallback((role: string) => {
  //   switch (role) {
  //     case 'ADMIN':
  //       return '🔴';
  //     case 'MANAGER':
  //       return '🟠';
  //     case 'EMPLOYEE':
  //       return '🔵';
  //     default:
  //       return '⚪';
  //   }
  // }, []);

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <TableRow className='hover:bg-gray-50'>
        <TableCell>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
              <span className='text-sm font-medium text-gray-600'>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <p className='font-medium text-gray-900'>
                {user.firstName} {user.lastName}
              </p>
              <p className='text-sm text-gray-500'>{user.email}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <RoleBadge role={user.roles as UserRole} />
        </TableCell>
        <TableCell>
          <div className='flex items-center gap-2'>
            <Mail className='h-4 w-4 text-gray-400' />
            <span className='text-sm'>{user.email}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-gray-400' />
            <span className='text-sm'>{formatDate(user.createdAt)}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className='flex items-center gap-2'>
            <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className='text-sm'>{user.isActive ? 'فعال' : 'غیرفعال'}</span>
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
              <DropdownMenuItem>مشاهده جزئیات</DropdownMenuItem>
              <DropdownMenuItem>ویرایش</DropdownMenuItem>
              <DropdownMenuItem className='text-red-600'>
                {user.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </OptimizedMotion>
  );
});

UserRow.displayName = 'UserRow';

export const UsersTable = memo(function UsersTable({ className }: UsersTableProps) {
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useUsers();

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-[#ff0a54]' />
              مدیریت کاربران
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
          <LoadingState
            isLoading={isLoading}
            error={error}
            onRetry={handleRefresh}
            loadingMessage='در حال بارگذاری کاربران...'
            errorMessage='خطا در بارگذاری کاربران'
          >
            {users.length === 0 ? (
              <EmptyState
                icon={Users}
                title='هیچ کاربری یافت نشد'
                description='هنوز هیچ کاربری در سیستم ثبت نشده است.'
                actionLabel='افزودن کاربر جدید'
                onAction={() => {/* Handle add user */}}
              />
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام و نام خانوادگی</TableHead>
                      <TableHead>نقش</TableHead>
                      <TableHead>ایمیل</TableHead>
                      <TableHead>تاریخ عضویت</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead className='w-12'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <UserRow key={user.id} user={user} index={index} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </LoadingState>
        </CardContent>
      </Card>
    </div>
  );
});
