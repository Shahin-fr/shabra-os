'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Calendar, FileText, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

// Validation schema
const NewLeaveRequestSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'STUDY', 'OTHER'], {
    required_error: 'نوع مرخصی الزامی است',
  }),
  startDate: z.string().min(1, 'تاریخ شروع الزامی است'),
  endDate: z.string().min(1, 'تاریخ پایان الزامی است'),
  reason: z.string().min(10, 'دلیل مرخصی باید حداقل ۱۰ کاراکتر باشد').max(500, 'دلیل مرخصی نمی‌تواند بیش از ۵۰۰ کاراکتر باشد'),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'تاریخ پایان باید بعد از تاریخ شروع باشد',
  path: ['endDate'],
});

type NewLeaveRequestFormData = z.infer<typeof NewLeaveRequestSchema>;

const leaveTypeOptions = [
  { value: 'ANNUAL', label: 'مرخصی سالانه', description: 'مرخصی استحقاقی سالانه' },
  { value: 'SICK', label: 'مرخصی استعلاجی', description: 'در صورت بیماری' },
  { value: 'UNPAID', label: 'مرخصی بدون حقوق', description: 'مرخصی بدون دریافت حقوق' },
  { value: 'EMERGENCY', label: 'مرخصی اضطراری', description: 'در موارد اضطراری' },
  { value: 'MATERNITY', label: 'مرخصی زایمان', description: 'مرخصی زایمان' },
  { value: 'PATERNITY', label: 'مرخصی پدری', description: 'مرخصی پدری' },
  { value: 'STUDY', label: 'مرخصی تحصیلی', description: 'برای امور تحصیلی' },
  { value: 'OTHER', label: 'سایر', description: 'سایر موارد' },
];

export function NewLeaveRequestForm() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<NewLeaveRequestFormData>({
    resolver: zodResolver(NewLeaveRequestSchema),
    defaultValues: {
      leaveType: undefined,
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const watchedStartDate = watch('startDate');

  // Create leave request mutation
  const createLeaveRequestMutation = useMutation({
    mutationFn: async (data: NewLeaveRequestFormData) => {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaveType: data.leaveType,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          reason: data.reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'خطا در ارسال درخواست مرخصی');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      toast.success('درخواست مرخصی با موفقیت ارسال شد', {
        description: 'درخواست شما در انتظار تایید مدیر است',
      });

      // Reset form
      reset();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
    onError: (error: Error) => {
      toast.error('خطا در ارسال درخواست مرخصی', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: NewLeaveRequestFormData) => {
    createLeaveRequestMutation.mutate(data);
  };

  const calculateDays = () => {
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const selectedLeaveType = watch('leaveType');
  const selectedTypeInfo = leaveTypeOptions.find(option => option.value === selectedLeaveType);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Leave Type */}
        <div className='space-y-2'>
          <Label htmlFor='leaveType' className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            نوع مرخصی
          </Label>
          <Select
            value={selectedLeaveType}
            onValueChange={(value) => setValue('leaveType', value as any)}
          >
            <SelectTrigger className={errors.leaveType ? 'border-red-500' : ''}>
              <SelectValue placeholder='انتخاب نوع مرخصی' />
            </SelectTrigger>
            <SelectContent>
              {leaveTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{option.label}</span>
                    <span className='text-xs text-gray-500'>{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.leaveType && (
            <p className='text-sm text-red-600 flex items-center gap-1'>
              <AlertCircle className='h-4 w-4' />
              {errors.leaveType.message}
            </p>
          )}
        </div>

        {/* Duration Display */}
        <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            مدت مرخصی
          </Label>
          <Card className='p-3 bg-blue-50 border-blue-200'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {calculateDays()}
              </div>
              <div className='text-sm text-blue-800'>روز</div>
            </div>
          </Card>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Start Date */}
        <div className='space-y-2'>
          <Label htmlFor='startDate' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            تاریخ شروع
          </Label>
          <Input
            id='startDate'
            type='date'
            {...register('startDate')}
            className={errors.startDate ? 'border-red-500' : ''}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.startDate && (
            <p className='text-sm text-red-600 flex items-center gap-1'>
              <AlertCircle className='h-4 w-4' />
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* End Date */}
        <div className='space-y-2'>
          <Label htmlFor='endDate' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            تاریخ پایان
          </Label>
          <Input
            id='endDate'
            type='date'
            {...register('endDate')}
            className={errors.endDate ? 'border-red-500' : ''}
            min={watchedStartDate || new Date().toISOString().split('T')[0]}
          />
          {errors.endDate && (
            <p className='text-sm text-red-600 flex items-center gap-1'>
              <AlertCircle className='h-4 w-4' />
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className='space-y-2'>
        <Label htmlFor='reason' className='flex items-center gap-2'>
          <FileText className='h-4 w-4' />
          دلیل مرخصی
        </Label>
        <Textarea
          id='reason'
          placeholder='دلیل درخواست مرخصی خود را به تفصیل شرح دهید...'
          {...register('reason')}
          className={errors.reason ? 'border-red-500' : ''}
          rows={4}
        />
        <div className='flex justify-between items-center'>
          {errors.reason ? (
            <p className='text-sm text-red-600 flex items-center gap-1'>
              <AlertCircle className='h-4 w-4' />
              {errors.reason.message}
            </p>
          ) : (
            <p className='text-sm text-gray-500'>
              {watch('reason')?.length || 0} / 500 کاراکتر
            </p>
          )}
        </div>
      </div>

      {/* Selected Type Info */}
      {selectedTypeInfo && (
        <OptimizedMotion
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className='p-4 bg-gray-50 border-gray-200'>
            <div className='flex items-start gap-3'>
              <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
              <div>
                <h4 className='font-medium text-gray-900 mb-1'>
                  {selectedTypeInfo.label}
                </h4>
                <p className='text-sm text-gray-600'>
                  {selectedTypeInfo.description}
                </p>
              </div>
            </div>
          </Card>
        </OptimizedMotion>
      )}

      {/* Submit Button */}
      <div className='flex justify-end pt-4'>
        <Button
          type='submit'
          disabled={isSubmitting}
          className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white px-8'
        >
          {isSubmitting ? (
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              در حال ارسال...
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Send className='h-4 w-4' />
              ارسال درخواست
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
