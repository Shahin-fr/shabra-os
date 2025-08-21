"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import { 
  Calendar, 
  Palette, 
  Settings, 
  Users, 
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import Link from "next/link";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { 
  ActivityChart, 
  StatCard, 
  RecentActivity, 
  QuickActions,
  MyTasks,
  TeamOverview
} from "@/components/dashboard";

export default function HomePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="container mx-auto max-w-7xl space-y-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  // Simplified animation variants for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="container mx-auto max-w-7xl space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
        {/* Enhanced Personalized Header */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            به سیستم عامل شبرا خوش آمدید
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            مرکز فرماندهی برای مدیریت محتوا و برنامه‌ریزی استوری‌های اینستاگرام
          </p>
        </motion.div>

        {/* Main Dashboard Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Content Area - Left Side */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            variants={itemVariants}
          >
            {/* Activity Chart */}
            <div className="w-full [&>*]:w-full">
              <ActivityChart />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <StatCard
                title="پروژه‌های فعال"
                value="3"
                icon={Target}
                trend="+12%"
                trendType="positive"
              />
              <StatCard
                title="وظایف در انتظار"
                value="12"
                icon={Clock}
                trend="+5"
                trendType="neutral"
              />
              <StatCard
                title="وظایف تکمیل شده"
                value="28"
                icon={CheckCircle}
                trend="+18%"
                trendType="positive"
              />
            </div>

            {/* Bottom Row: Recent Activity and My Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
              <div className="lg:col-span-3 w-full [&>*]:h-full [&>*]:w-full">
                <RecentActivity />
              </div>
              <div className="lg:col-span-2 w-full [&>*]:h-full [&>*]:w-full">
                <MyTasks />
              </div>
            </div>
          </motion.div>

          {/* Sidebar - Right Side */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Team Overview */}
            <TeamOverview />
          </motion.div>
        </motion.div>

        {/* Legacy Feature Cards - Now as Secondary Section */}
        <motion.div 
          className="mt-12 pb-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ابزارهای اصلی</h2>
            <p className="text-gray-600">دسترسی به تمام قابلیت‌های سیستم</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Storyboard Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link href="/storyboard">
                <Card className="group cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-10">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#ff0a54] transition-colors duration-300">
                          استوری بورد
                        </h3>
                        <p className="text-sm text-gray-600">
                          برنامه‌ریزی بصری استوری‌های اینستاگرام
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Palette className="h-6 w-6 text-[#ff0a54]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Projects Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link href="/projects">
                <Card className="group cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-10">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#ff0a54] transition-colors duration-300">
                          پروژه‌ها
                        </h3>
                        <p className="text-sm text-gray-600">
                          مدیریت پروژه‌ها و محتوای دیجیتال
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-[#ff0a54]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Analytics Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Link href="/analytics">
                <Card className="group cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-10">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#ff0a54] transition-colors duration-300">
                          تحلیل‌ها
                        </h3>
                        <p className="text-sm text-gray-600">
                          گزارش‌های عملکرد و آمار
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="h-6 w-6 text-[#ff0a54]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Calendar Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link href="/calendar">
                <Card className="group cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-10">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#ff0a54] transition-colors duration-300">
                          تقویم
                        </h3>
                        <p className="text-sm text-gray-600">
                          برنامه‌ریزی زمانی و رویدادها
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-[#ff0a54]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Team Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Link href="/team">
                <Card className="group cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-10">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#ff0a54] transition-colors duration-300">
                          تیم
                        </h3>
                        <p className="text-sm text-gray-600">
                          مدیریت اعضای تیم و همکاری
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-[#ff0a54]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Settings Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <Link href="/settings">
                <Card className="group cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-10">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#ff0a54] transition-colors duration-300">
                          تنظیمات
                        </h3>
                        <p className="text-sm text-gray-600">
                          پیکربندی حساب کاربری و سیستم
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Settings className="h-6 w-6 text-[#ff0a54]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
  );
}
