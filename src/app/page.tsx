'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  Palette,
  FileText,
  CheckCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import {
  ActivityChart,
  StatCard,
  RecentActivity,
  QuickActions,
  MyTasks,
  TeamOverview,
} from '@/components/dashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { MobileDashboard } from '@/components/dashboard/MobileDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useResponsive';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const isMobile = useMobile();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading only briefly while session is being established
  if (isLoading) {
    return (
      <div className='container mx-auto max-w-7xl space-y-10'>
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-3 text-muted-foreground'>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if no user yet
  if (!user) {
    return null;
  }

  // Check user roles for conditional rendering
  const userRoles = user.roles || [];
  const isEmployeeOnly =
    userRoles.length === 1 && userRoles.includes('EMPLOYEE');
  const isAdminOrManager = userRoles.some(
    role => role === 'ADMIN' || role === 'MANAGER'
  );

  // If user is only an employee, show the employee dashboard
  if (isEmployeeOnly && !isAdminOrManager) {
    return <EmployeeDashboard />;
  }

  // Show mobile dashboard for mobile devices
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Simplified animation variants for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className='container mx-auto max-w-7xl space-y-8'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Personalized Header */}
      <motion.div
        className='text-center space-y-4'
        variants={itemVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.h1
          className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-4xl'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          سلام، {user.name}! 👋
        </motion.h1>
        <motion.p
          className='text-muted-foreground text-lg'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          به داشبورد Shabra OS خوش آمدید
        </motion.p>

        {/* Mobile Navigation Notice */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='mt-4 p-3 bg-[#ff0a54]/10 rounded-lg border border-[#ff0a54]/20'
          >
            <p className='text-sm text-[#ff0a54] font-medium'>
              🎉 تجربه موبایل جدید! از نوار پایین برای ناوبری استفاده کنید
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Row 1: Individual Navigation Widgets - Restored Original Design */}
      <motion.div
        className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.div variants={itemVariants}>
          <Link href='/tasks'>
            <Card
              className='group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105'
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 8px 25px rgba(0, 0, 0, 0.1),
                  0 4px 15px rgba(255, 10, 84, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4)
                `,
              }}
            >
              <CardContent className='p-6 text-center'>
                <div className='w-12 h-12 bg-[#ff0a54]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ff0a54]/30 transition-colors'>
                  <FileText className='h-6 w-6 text-[#ff0a54]' />
                </div>
                <h3 className='font-semibold text-foreground mb-2'>تسک‌ها</h3>
                <p className='text-sm text-muted-foreground'>مدیریت تسک‌ها</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href='/storyboard'>
            <Card
              className='group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105'
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 8px 25px rgba(0, 0, 0, 0.1),
                  0 4px 15px rgba(255, 10, 84, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4)
                `,
              }}
            >
              <CardContent className='p-6 text-center'>
                <div className='w-12 h-12 bg-[#ff0a54]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ff0a54]/30 transition-colors'>
                  <Palette className='h-6 w-6 text-[#ff0a54]' />
                </div>
                <h3 className='font-semibold text-foreground mb-2'>
                  استوری‌بورد
                </h3>
                <p className='text-sm text-muted-foreground'>
                  مدیریت محتوای بصری
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href='/content-calendar'>
            <Card
              className='group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105'
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 8px 25px rgba(0, 0, 0, 0.1),
                  0 4px 15px rgba(255, 10, 84, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4)
                `,
              }}
            >
              <CardContent className='p-6 text-center'>
                <div className='w-12 h-12 bg-[#ff0a54]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ff0a54]/30 transition-colors'>
                  <Calendar className='h-6 w-6 text-[#ff0a54]' />
                </div>
                <h3 className='font-semibold text-foreground mb-2'>
                  تقویم محتوا
                </h3>
                <p className='text-sm text-muted-foreground'>
                  برنامه‌ریزی محتوا
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href='/wiki'>
            <Card
              className='group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105'
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 8px 25px rgba(0, 0, 0, 0.1),
                  0 4px 15px rgba(255, 10, 84, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4)
                `,
              }}
            >
              <CardContent className='p-6 text-center'>
                <div className='w-12 h-12 bg-[#ff0a54]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ff0a54]/30 transition-colors'>
                  <BookOpen className='h-6 w-6 text-[#ff0a54]' />
                </div>
                <h3 className='font-semibold text-foreground mb-2'>شبرالوگ</h3>
                <p className='text-sm text-muted-foreground'>پایگاه دانش</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </motion.div>

      {/* Row 2: Main Chart and Stats - 75/25 Split */}
      <motion.div
        className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Left Side - Large Widget (Weekly Activity Chart) - 75% width */}
        <motion.div
          className={`${isMobile ? 'order-1' : 'lg:col-span-3'}`}
          variants={itemVariants}
        >
          <ActivityChart />
        </motion.div>

        {/* Right Side - Small Widgets Stack - 25% width */}
        <motion.div
          className={`space-y-6 ${isMobile ? 'order-2' : 'lg:col-span-1'}`}
          variants={itemVariants}
        >
          {/* Quick Actions Widget */}
          <QuickActions />

          {/* Team Members Widget */}
          <TeamOverview />
        </motion.div>
      </motion.div>

      {/* Row 3: Horizontal Stat Widgets */}
      <motion.div
        className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title='تسک‌های فعال'
            value='15'
            icon={CheckCircle}
            trend='+3'
            trendType='positive'
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            title='وظایف در انتظار'
            value='15'
            icon={Clock}
            trend='+3'
            trendType='neutral'
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            title='وظایف تکمیل شده'
            value='23'
            icon={CheckCircle}
            trend='+5'
            trendType='positive'
          />
        </motion.div>
      </motion.div>

      {/* Row 4: Activity Feeds */}
      <motion.div
        className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Recent Activities */}
        <motion.div variants={itemVariants}>
          <RecentActivity />
        </motion.div>

        {/* My Tasks */}
        <motion.div variants={itemVariants}>
          <MyTasks />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
