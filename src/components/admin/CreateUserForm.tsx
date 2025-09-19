'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { UserPlus, Mail, Lock, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Validation schema
const CreateUserSchema = z.object({
  email: z.string().email('فرمت ایمیل نامعتبر است'),
  password: z.string().min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد'),
  firstName: z.string().min(1, 'نام الزامی است').max(50, 'نام باید کمتر از 50 کاراکتر باشد'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است').max(50, 'نام خانوادگی باید کمتر از 50 کاراکتر باشد'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'], {
    errorMap: () => ({ message: 'نقش باید یکی از موارد زیر باشد: ADMIN, MANAGER, EMPLOYEE' })
  }),
});

type CreateUserFormData = z.infer<typeof CreateUserSchema>;

interface CreateUserFormProps {
  className?: string;
}

export function CreateUserForm({ className }: CreateUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'EMPLOYEE',
    },
  });

  const selectedRole = watch('role');

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserFormData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'خطا در ایجاد کاربر');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsSubmitting(true);
    },
    onSuccess: (data) => {
      toast.success('کاربر با موفقیت ایجاد شد', {
        description: `کاربر ${data.data.firstName} ${data.data.lastName} با نقش ${data.data.role} ایجاد شد`,
      });
      
      // Reset form
      reset();
      
      // Invalidate users query to refresh the table
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error('خطا در ایجاد کاربر', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: CreateUserFormData) => {
    createUserMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className='h-4 w-4 text-red-600' />;
      case 'MANAGER':
        return <Shield className='h-4 w-4 text-orange-600' />;
      case 'EMPLOYEE':
        return <User className='h-4 w-4 text-blue-600' />;
      default:
        return <User className='h-4 w-4 text-gray-600' />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'مدیر کل';
      case 'MANAGER':
        return 'مدیر';
      case 'EMPLOYEE':
        return 'کارمند';
      default:
        return role;
    }
  };

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserPlus className='h-5 w-5 text-[#ff0a54]' />
            ایجاد کاربر جدید
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Personal Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900'>اطلاعات شخصی</h3>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* First Name */}
                <div className='space-y-2'>
                  <Label htmlFor='firstName' className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    نام
                  </Label>
                  <Input
                    id='firstName'
                    {...register('firstName')}
                    placeholder='نام را وارد کنید'
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className='text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='h-4 w-4' />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className='space-y-2'>
                  <Label htmlFor='lastName' className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    نام خانوادگی
                  </Label>
                  <Input
                    id='lastName'
                    {...register('lastName')}
                    placeholder='نام خانوادگی را وارد کنید'
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className='text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='h-4 w-4' />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900'>اطلاعات حساب کاربری</h3>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Email */}
                <div className='space-y-2'>
                  <Label htmlFor='email' className='flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    ایمیل
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    {...register('email')}
                    placeholder='ایمیل را وارد کنید'
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className='text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='h-4 w-4' />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className='space-y-2'>
                  <Label htmlFor='password' className='flex items-center gap-2'>
                    <Lock className='h-4 w-4' />
                    رمز عبور
                  </Label>
                  <Input
                    id='password'
                    type='password'
                    {...register('password')}
                    placeholder='رمز عبور را وارد کنید'
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className='text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='h-4 w-4' />
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900'>نقش کاربری</h3>
              
              <div className='space-y-2'>
                <Label htmlFor='role' className='flex items-center gap-2'>
                  <Shield className='h-4 w-4' />
                  نقش
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setValue('role', value as 'ADMIN' | 'MANAGER' | 'EMPLOYEE')}
                >
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder='نقش کاربر را انتخاب کنید' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='EMPLOYEE'>
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4 text-blue-600' />
                        کارمند
                      </div>
                    </SelectItem>
                    <SelectItem value='MANAGER'>
                      <div className='flex items-center gap-2'>
                        <Shield className='h-4 w-4 text-orange-600' />
                        مدیر
                      </div>
                    </SelectItem>
                    <SelectItem value='ADMIN'>
                      <div className='flex items-center gap-2'>
                        <Shield className='h-4 w-4 text-red-600' />
                        مدیر کل
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className='text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='h-4 w-4' />
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Role Preview */}
              {selectedRole && (
                <OptimizedMotion
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='p-3 bg-gray-50 rounded-lg border border-gray-200'
                >
                  <div className='flex items-center gap-2 text-sm text-gray-700'>
                    <span>نقش انتخاب شده:</span>
                    <div className='flex items-center gap-2'>
                      {getRoleIcon(selectedRole)}
                      <span className='font-medium'>{getRoleLabel(selectedRole)}</span>
                    </div>
                  </div>
                </OptimizedMotion>
              )}
            </div>

            {/* Submit Button */}
            <div className='flex justify-end gap-4 pt-4 border-t border-gray-200'>
              <Button
                type='button'
                variant='outline'
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                پاک کردن فرم
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
              >
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    در حال ایجاد...
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4' />
                    ایجاد کاربر
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}
