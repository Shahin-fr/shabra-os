'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  CheckSquare, 
  Clock, 
  TrendingUp,
  Building,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

import { CompleteProfileData } from '@/types/profile';

interface ProfileOverviewProps {
  profileData: CompleteProfileData;
}

export function ProfileOverview({ profileData }: ProfileOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'MANAGER':
        return 'default';
      case 'EMPLOYEE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'PAUSED':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              اطلاعات پایه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">ایمیل:</span>
                  <span className="font-medium">{profileData.user.email}</span>
                </div>
                
                {profileData.profile?.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">تلفن:</span>
                    <span className="font-medium">{profileData.profile.phoneNumber}</span>
                  </div>
                )}

                {profileData.profile?.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">آدرس:</span>
                    <span className="font-medium">{profileData.profile.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">تاریخ عضویت:</span>
                  <span className="font-medium">{formatDate(profileData.user.createdAt)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">نقش:</span>
                  <Badge variant={getRoleBadgeVariant(profileData.user.roles)}>
                    {profileData.user.roles}
                  </Badge>
                </div>

                {profileData.manager && (
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">مدیر:</span>
                    <Link 
                      href={`/profile/${profileData.manager.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {profileData.manager.firstName} {profileData.manager.lastName}
                    </Link>
                  </div>
                )}

                {profileData.subordinates.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">تعداد زیردستان:</span>
                    <span className="font-medium">{profileData.subordinates.length}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Performance Snapshot */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              خلاصه عملکرد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Projects */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {profileData.performance.projectCount}
                </div>
                <div className="text-sm text-gray-600">پروژه‌های فعال</div>
              </div>

              {/* Tasks Completed */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {profileData.performance.taskCounts.Done}
                </div>
                <div className="text-sm text-gray-600">تسک‌های تکمیل شده</div>
              </div>

              {/* Tasks In Progress */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {profileData.performance.taskCounts.InProgress}
                </div>
                <div className="text-sm text-gray-600">تسک‌های در حال انجام</div>
              </div>

              {/* Attendance */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {profileData.performance.attendanceCount}
                </div>
                <div className="text-sm text-gray-600">روزهای حضور (30 روز گذشته)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Recent Activity */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              فعالیت‌های اخیر
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.recentTasks.length > 0 ? (
              <div className="space-y-3">
                {profileData.recentTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      {task.project && (
                        <div className="text-sm text-gray-600">
                          پروژه: {task.project.name}
                        </div>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                هیچ فعالیت اخیری یافت نشد
              </div>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>
    </div>
  );
}
