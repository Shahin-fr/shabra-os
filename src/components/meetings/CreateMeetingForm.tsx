'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { JalaliDateTimePicker } from '@/components/ui/jalali-datetime-picker';
import { toast } from 'sonner';

const createMeetingSchema = z.object({
  title: z.string().min(1, 'عنوان جلسه الزامی است'),
  startTime: z.date({ required_error: 'زمان شروع الزامی است' }),
  endTime: z.date({ required_error: 'زمان پایان الزامی است' }),
  type: z.enum(['ONE_ON_ONE', 'TEAM_MEETING']),
  attendeeIds: z.array(z.string()).min(1, 'حداقل یک شرکت‌کننده الزامی است'),
  notes: z.string().optional(),
});

type CreateMeetingFormData = z.infer<typeof createMeetingSchema>;

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface CreateMeetingFormProps {
  onSuccess: () => void;
  initialDate?: Date;
}

export function CreateMeetingForm({ onSuccess, initialDate }: CreateMeetingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateMeetingFormData>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: '',
      startTime: initialDate || new Date(),
      endTime: initialDate ? new Date(initialDate.getTime() + 60 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000),
      type: 'ONE_ON_ONE',
      attendeeIds: [],
      notes: '',
    },
  });

  // Fetch users for attendee selection
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'assignable'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('/api/users/assignable');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  const onSubmit = async (data: CreateMeetingFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startTime: data.startTime.toISOString(),
          endTime: data.endTime.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'خطا در ایجاد جلسه');
      }

      toast.success('جلسه با موفقیت ایجاد شد');
      onSuccess();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error(error instanceof Error ? error.message : 'خطا در ایجاد جلسه');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttendeeToggle = (userId: string, checked: boolean) => {
    const currentAttendees = form.getValues('attendeeIds');
    if (checked) {
      form.setValue('attendeeIds', [...currentAttendees, userId]);
    } else {
      form.setValue('attendeeIds', currentAttendees.filter(id => id !== userId));
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              اطلاعات جلسه
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان جلسه *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="عنوان جلسه را وارد کنید"
              className="mt-1"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="type">نوع جلسه *</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(value) => form.setValue('type', value as 'ONE_ON_ONE' | 'TEAM_MEETING')}
            >
              <SelectTrigger className="mt-1 w-full justify-end text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONE_ON_ONE">جلسه یک به یک</SelectItem>
                <SelectItem value="TEAM_MEETING">جلسه تیمی</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

        {/* Time and Date */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              زمان‌بندی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">زمان شروع *</Label>
              <JalaliDateTimePicker
                value={form.watch('startTime')}
                onChange={(date) => {
                  form.setValue('startTime', date || new Date(), { shouldValidate: true });
                }}
                placeholder="انتخاب زمان شروع"
                className="mt-1"
              />
              {form.formState.errors.startTime && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.startTime.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="endTime">زمان پایان *</Label>
              <JalaliDateTimePicker
                value={form.watch('endTime')}
                onChange={(date) => {
                  form.setValue('endTime', date || new Date(), { shouldValidate: true });
                }}
                placeholder="انتخاب زمان پایان"
                className="mt-1"
              />
              {form.formState.errors.endTime && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Time Preview */}
          {form.watch('startTime') && form.watch('endTime') && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <Calendar className="h-4 w-4 inline ms-1" />
                {formatDate(form.watch('startTime'))}
              </p>
              <p className="text-sm text-gray-600">
                <Clock className="h-4 w-4 inline ms-1" />
                {formatTime(form.watch('startTime'))} - {formatTime(form.watch('endTime'))}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

        {/* Attendees */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              شرکت‌کنندگان
            </CardTitle>
          </CardHeader>
          <CardContent>
          {usersLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff0a54] mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">در حال بارگذاری...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pe-2">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 rtl:space-x-reverse space-x-reverse p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Checkbox
                    id={`attendee-${user.id}`}
                    checked={form.watch('attendeeIds').includes(user.id)}
                    onCheckedChange={(checked) => 
                      handleAttendeeToggle(user.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`attendee-${user.id}`}
                    className="flex items-center space-x-3 rtl:space-x-reverse space-x-reverse cursor-pointer flex-1"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">
                      {user.firstName} {user.lastName}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
          {form.formState.errors.attendeeIds && (
            <p className="text-sm text-red-600 mt-2">
              {form.formState.errors.attendeeIds.message}
            </p>
          )}
        </CardContent>
      </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">یادداشت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
          <Textarea
            {...form.register('notes')}
            placeholder="یادداشت‌های اضافی درباره جلسه..."
            rows={4}
          />
        </CardContent>
      </Card>

        {/* Submit Button */}
        <div className="flex justify-end rtl:justify-start gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
            className="px-6"
          >
            پاک کردن
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 shadow-lg"
          >
            {isSubmitting ? 'در حال ایجاد...' : 'ایجاد جلسه'}
          </Button>
        </div>
      </form>
    </div>
  );
}
