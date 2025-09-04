'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Bell,
  Shield,
  LogOut,
  Edit3,
  Calendar,
  BarChart3,
  Users,
  FileText,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

// Mock user data
const mockUser = {
  id: '1',
  firstName: 'احمد',
  lastName: 'محمدی',
  email: 'ahmad.mohammadi@example.com',
  role: 'MANAGER',
  avatar: null,
  joinDate: '2023-01-15',
  lastActive: '2024-01-10',
  stats: {
    completedTasks: 45,
    activeProjects: 8,
    teamMembers: 12,
    documents: 23,
  },
};

const roleLabels = {
  ADMIN: 'مدیر سیستم',
  MANAGER: 'مدیر پروژه',
  EMPLOYEE: 'کارمند',
};

const roleColors = {
  ADMIN: 'bg-red-100 text-red-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  EMPLOYEE: 'bg-green-100 text-green-800',
};

const menuItems = [
  {
    id: 'settings',
    label: 'تنظیمات',
    icon: Settings,
    href: '/settings',
  },
  {
    id: 'notifications',
    label: 'اعلان‌ها',
    icon: Bell,
    href: '/notifications',
  },
  {
    id: 'security',
    label: 'امنیت',
    icon: Shield,
    href: '/security',
  },
  {
    id: 'analytics',
    label: 'تحلیل‌ها',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    id: 'team',
    label: 'مدیریت تیم',
    icon: Users,
    href: '/team',
  },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = user || mockUser;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30'>
      <div className='container mx-auto px-4 py-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-[#ff0a54]/10 rounded-xl'>
              <User className='h-6 w-6 text-[#ff0a54]' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>پروفایل</h1>
              <p className='text-gray-600'>مدیریت حساب کاربری</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='space-y-6'
        >
          {/* Profile Card */}
          <motion.div variants={itemVariants}>
            <Card
              className='overflow-hidden'
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <CardHeader className='pb-4'>
                <div className='flex items-center gap-4'>
                  <Avatar className='h-20 w-20'>
                    <AvatarImage src={currentUser.avatar || undefined} />
                    <AvatarFallback className='bg-[#ff0a54]/10 text-[#ff0a54] text-xl'>
                      {'firstName' in currentUser ? currentUser.firstName?.[0] : currentUser.name?.[0]}
                      {'lastName' in currentUser ? currentUser.lastName?.[0] : ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h2 className='text-xl font-bold text-gray-900'>
                        {'firstName' in currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.name}
                      </h2>
                      <Badge
                        className={
                          roleColors[
                            ('role' in currentUser ? currentUser.role : currentUser.roles[0]) as keyof typeof roleColors
                          ]
                        }
                      >
                        {
                          roleLabels[
                            ('role' in currentUser ? currentUser.role : currentUser.roles[0]) as keyof typeof roleLabels
                          ]
                        }
                      </Badge>
                    </div>
                    <p className='text-gray-600 mb-1'>{currentUser.email}</p>
                    <p className='text-sm text-gray-500'>
                      عضو از {'joinDate' in currentUser ? currentUser.joinDate : 'نامشخص'}
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setIsEditing(!isEditing)}
                    className='text-[#ff0a54] border-[#ff0a54] hover:bg-[#ff0a54] hover:text-white'
                  >
                    <Edit3 className='h-4 w-4 ml-2' />
                    ویرایش
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants}>
            <div className='grid grid-cols-2 gap-4'>
              <Card
                className='text-center'
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <CardContent className='pt-6'>
                  <div className='p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3'>
                    <FileText className='h-6 w-6 text-blue-600' />
                  </div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {mockUser.stats.completedTasks}
                  </div>
                  <p className='text-sm text-gray-600'>وظایف انجام شده</p>
                </CardContent>
              </Card>

              <Card
                className='text-center'
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <CardContent className='pt-6'>
                  <div className='p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3'>
                    <Calendar className='h-6 w-6 text-purple-600' />
                  </div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {mockUser.stats.activeProjects}
                  </div>
                  <p className='text-sm text-gray-600'>پروژه‌های فعال</p>
                </CardContent>
              </Card>

              <Card
                className='text-center'
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <CardContent className='pt-6'>
                  <div className='p-3 bg-green-100 rounded-full w-fit mx-auto mb-3'>
                    <Users className='h-6 w-6 text-green-600' />
                  </div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {mockUser.stats.teamMembers}
                  </div>
                  <p className='text-sm text-gray-600'>اعضای تیم</p>
                </CardContent>
              </Card>

              <Card
                className='text-center'
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <CardContent className='pt-6'>
                  <div className='p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3'>
                    <BarChart3 className='h-6 w-6 text-orange-600' />
                  </div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {mockUser.stats.documents}
                  </div>
                  <p className='text-sm text-gray-600'>مستندات</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Menu Items */}
          <motion.div variants={itemVariants}>
            <Card
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <CardHeader>
                <CardTitle className='text-lg'>تنظیمات و مدیریت</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id}>
                      <Button
                        variant='ghost'
                        className='w-full justify-start h-12 px-4'
                        onClick={() => (window.location.href = item.href)}
                      >
                        <Icon className='h-5 w-5 ml-3 text-gray-600' />
                        <span className='text-gray-900'>{item.label}</span>
                      </Button>
                      {index < menuItems.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Logout Button */}
          <motion.div variants={itemVariants}>
            <Button
              variant='destructive'
              className='w-full h-12'
              onClick={() => {
                // Handle logout
                console.log('Logout clicked');
              }}
            >
              <LogOut className='h-4 w-4 ml-2' />
              خروج از حساب کاربری
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
