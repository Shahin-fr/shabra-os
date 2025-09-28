'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  User, 
  ArrowLeft, 
  AlertCircle, 
  Loader2,
  Shield,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { ProfileOverview } from '@/components/profile/ProfileOverview';
import { ProfileDetails } from '@/components/profile/ProfileDetails';
import { ProfileTasksProjects } from '@/components/profile/ProfileTasksProjects';
import { ProfileHRInfo } from '@/components/profile/ProfileHRInfo';
import { ProfileDocuments } from '@/components/profile/ProfileDocuments';
import { ProfileChecklists } from '@/components/profile/ProfileChecklists';

import { CompleteProfileData } from '@/types/profile';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params.userId as string;

  // Check if user has permission to view this profile
  const canViewProfile = () => {
    if (!currentUser) return false;
    
    // User can always view their own profile
    if (currentUser.id === userId) return true;
    
    // Admins can view anyone's profile
    if (currentUser.roles?.includes('ADMIN')) return true;
    
    // Managers can view their subordinates' profiles (server-side validation will verify this)
    if (currentUser.roles?.includes('MANAGER')) {
      return true; // Server will validate the actual manager-subordinate relationship
    }
    
    return false;
  };

  // Fetch profile data
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<CompleteProfileData> => {
      const response = await fetch(`/api/profiles/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در دریافت اطلاعات پروفایل');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: canViewProfile(),
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data doesn't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false, // Don't refetch on window focus for profile data
  });

  if (!canViewProfile()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold mb-4">دسترسی غیرمجاز</h1>
              <p className="text-gray-600 mb-6">
                شما مجاز به مشاهده این پروفایل نیستید.
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="rtl:rotate-180 h-4 w-4 me-2" />
                بازگشت
              </Button>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>در حال بارگذاری پروفایل...</p>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              خطا در بارگذاری پروفایل: {error.message}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => refetch()} variant="outline">
              تلاش مجدد
            </Button>
          </div>
        </OptimizedMotion>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h1 className="text-2xl font-bold mb-4">پروفایل یافت نشد</h1>
              <p className="text-gray-600 mb-6">
                پروفایل مورد نظر یافت نشد.
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="rtl:rotate-180 h-4 w-4 me-2" />
                بازگشت
              </Button>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="rtl:rotate-180 h-4 w-4 me-2" />
            بازگشت
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {profileData.user.avatar ? (
                <img
                  src={profileData.user.avatar}
                  alt={`${profileData.user.firstName} ${profileData.user.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                `${profileData.user.firstName.charAt(0)}${profileData.user.lastName.charAt(0)}`
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {profileData.user.firstName} {profileData.user.lastName}
              </h1>
              <p className="text-gray-600">
                {profileData.profile?.jobTitle || 'بدون عنوان شغلی'} - {profileData.profile?.department || 'بدون بخش'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`grid w-full ${currentUser?.roles?.includes('ADMIN') ? 'grid-cols-3 md:grid-cols-6' : 'grid-cols-3 md:grid-cols-5'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              خلاصه
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              اطلاعات کامل
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              وظایف
            </TabsTrigger>
            <TabsTrigger value="hr" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              منابع انسانی
            </TabsTrigger>
            {currentUser?.roles?.includes('ADMIN') && (
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                اسناد
              </TabsTrigger>
            )}
            <TabsTrigger value="checklists" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              چک‌لیست‌ها
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ProfileOverview profileData={profileData} />
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <ProfileDetails profileData={profileData} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <ProfileTasksProjects profileData={profileData} />
          </TabsContent>

          <TabsContent value="hr" className="mt-6">
            <ProfileHRInfo profileData={profileData} />
          </TabsContent>

          {currentUser?.roles?.includes('ADMIN') && (
            <TabsContent value="documents" className="mt-6">
              <ProfileDocuments userId={userId} />
            </TabsContent>
          )}

          <TabsContent value="checklists" className="mt-6">
            <ProfileChecklists userId={userId} />
          </TabsContent>
        </Tabs>
      </OptimizedMotion>
    </div>
  );
}
