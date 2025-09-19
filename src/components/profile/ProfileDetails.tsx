'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  UserPlus,
  Edit,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { CompleteProfileData } from '@/types/profile';

interface ProfileDetailsProps {
  profileData: CompleteProfileData;
  onUpdate: () => void;
}

// Validation schema
const ProfileSchema = z.object({
  jobTitle: z.string().min(1, 'عنوان شغلی الزامی است'),
  department: z.string().min(1, 'بخش الزامی است'),
  startDate: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

export function ProfileDetails({ profileData, onUpdate }: ProfileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      jobTitle: profileData.profile?.jobTitle || '',
      department: profileData.profile?.department || '',
      startDate: profileData.profile?.startDate ? 
        new Date(profileData.profile.startDate).toISOString().split('T')[0] : '',
      phoneNumber: profileData.profile?.phoneNumber || '',
      address: profileData.profile?.address || '',
      emergencyContactName: profileData.profile?.emergencyContactName || '',
      emergencyContactPhone: profileData.profile?.emergencyContactPhone || '',
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch(`/api/profiles/${profileData.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در به‌روزرسانی پروفایل');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('پروفایل با موفقیت به‌روزرسانی شد');
      setIsEditing(false);
      onUpdate();
    },
    onError: (error: Error) => {
      toast.error('خطا در به‌روزرسانی پروفایل', {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                اطلاعات پروفایل
              </CardTitle>
              {!isEditing && (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 me-2" />
                  ویرایش
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">عنوان شغلی *</Label>
                    <Input
                      id="jobTitle"
                      {...register('jobTitle')}
                      placeholder="عنوان شغلی خود را وارد کنید"
                    />
                    {errors.jobTitle && (
                      <p className="text-sm text-red-600">{errors.jobTitle.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">بخش *</Label>
                    <Input
                      id="department"
                      {...register('department')}
                      placeholder="بخش خود را وارد کنید"
                    />
                    {errors.department && (
                      <p className="text-sm text-red-600">{errors.department.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">تاریخ شروع کار</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">شماره تلفن</Label>
                    <Input
                      id="phoneNumber"
                      {...register('phoneNumber')}
                      placeholder="شماره تلفن خود را وارد کنید"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">آدرس</Label>
                  <Textarea
                    id="address"
                    {...register('address')}
                    placeholder="آدرس خود را وارد کنید"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">نام تماس اضطراری</Label>
                    <Input
                      id="emergencyContactName"
                      {...register('emergencyContactName')}
                      placeholder="نام تماس اضطراری"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">تلفن تماس اضطراری</Label>
                    <Input
                      id="emergencyContactPhone"
                      {...register('emergencyContactPhone')}
                      placeholder="تلفن تماس اضطراری"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                  >
                    <X className="h-4 w-4 me-2" />
                    لغو
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">عنوان شغلی:</span>
                      <span className="font-medium">
                        {profileData.profile?.jobTitle || 'تعریف نشده'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">بخش:</span>
                      <span className="font-medium">
                        {profileData.profile?.department || 'تعریف نشده'}
                      </span>
                    </div>

                    {profileData.profile?.startDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">تاریخ شروع کار:</span>
                        <span className="font-medium">
                          {formatDate(profileData.profile.startDate)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">ایمیل:</span>
                      <span className="font-medium">{profileData.user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
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

                    {profileData.profile?.emergencyContactName && (
                      <div className="flex items-center gap-3">
                        <UserPlus className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">تماس اضطراری:</span>
                        <span className="font-medium">
                          {profileData.profile.emergencyContactName}
                          {profileData.profile.emergencyContactPhone && 
                            ` (${profileData.profile.emergencyContactPhone})`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!profileData.profile && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      اطلاعات پروفایل تکمیل نشده است. برای تکمیل اطلاعات روی دکمه ویرایش کلیک کنید.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>
    </div>
  );
}
