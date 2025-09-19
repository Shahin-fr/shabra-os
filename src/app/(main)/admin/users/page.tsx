'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Users, UserPlus, Shield, Settings } from 'lucide-react';

import { CreateUserForm } from '@/components/admin/CreateUserForm';
import { UsersTable } from '@/components/admin/UsersTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('users');

  // Show loading state
  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-[#ff0a54] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Check if user has required roles
  const userRoles = session?.user?.roles || [];
  const hasAdminAccess = userRoles.includes('ADMIN') || userRoles.includes('MANAGER');

  if (!hasAdminAccess) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 flex items-center justify-center'>
        <Card className='max-w-md mx-auto'>
          <CardHeader className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Shield className='h-8 w-8 text-red-600' />
            </div>
            <CardTitle className='text-xl text-red-600'>دسترسی محدود</CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='text-gray-600 mb-4'>
              شما دسترسی لازم برای مشاهده این صفحه را ندارید.
            </p>
            <p className='text-sm text-gray-500'>
              این صفحه فقط برای مدیران و مدیران ارشد قابل دسترسی است.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    {
      id: 'users',
      label: 'لیست کاربران',
      icon: Users,
      description: 'مشاهده و مدیریت تمام کاربران سیستم',
    },
    {
      id: 'create-user',
      label: 'ایجاد کاربر جدید',
      icon: UserPlus,
      description: 'افزودن کاربر جدید به سیستم',
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30'>
      <div className='container mx-auto px-4 py-6'>
        {/* Header */}
        <OptimizedMotion
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-[#ff0a54]/10 rounded-xl'>
              <Settings className='h-6 w-6 text-[#ff0a54]' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                مدیریت کاربران
              </h1>
              <p className='text-gray-600'>مدیریت کامل کاربران سیستم</p>
            </div>
          </div>
        </OptimizedMotion>

        {/* Stats Cards */}
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'
        >
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                کل کاربران
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>-</div>
              <p className='text-xs text-muted-foreground'>
                کاربران فعال در سیستم
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                مدیران
              </CardTitle>
              <Shield className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>-</div>
              <p className='text-xs text-muted-foreground'>
                کاربران با دسترسی مدیریت
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                کارمندان
              </CardTitle>
              <UserPlus className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>-</div>
              <p className='text-xs text-muted-foreground'>
                کاربران عادی سیستم
              </p>
            </CardContent>
          </Card>
        </OptimizedMotion>

        {/* Main Content */}
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid w-full grid-cols-2'>
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className='flex items-center gap-2'
                >
                  <tab.icon className='h-4 w-4' />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value='users' className='space-y-6'>
              <UsersTable />
            </TabsContent>

            <TabsContent value='create-user' className='space-y-6'>
              <CreateUserForm />
            </TabsContent>
          </Tabs>
        </OptimizedMotion>
      </div>
    </div>
  );
}
