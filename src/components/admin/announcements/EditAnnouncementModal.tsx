'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  X, 
  Save, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

// Validation schema
const UpdateAnnouncementSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(200, 'عنوان باید کمتر از 200 کاراکتر باشد'),
  content: z.string().min(1, 'محتوای اعلان الزامی است'),
  category: z.enum(['GENERAL', 'TECHNICAL', 'EVENT', 'IMPORTANT'], {
    errorMap: () => ({ message: 'دسته‌بندی نامعتبر است' })
  }),
  isPinned: z.boolean(),
});

type UpdateAnnouncementFormData = z.infer<typeof UpdateAnnouncementSchema>;

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface EditAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onSuccess: () => void;
}

export function EditAnnouncementModal({ 
  open, 
  onOpenChange, 
  announcement,
  onSuccess 
}: EditAnnouncementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateAnnouncementFormData>({
    resolver: zodResolver(UpdateAnnouncementSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'GENERAL',
      isPinned: false,
    },
  });

  const isPinned = watch('isPinned');

  // Update form when announcement changes
  useEffect(() => {
    if (announcement) {
      reset({
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        isPinned: announcement.isPinned,
      });
    }
  }, [announcement, reset]);

  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
    mutationFn: async (data: UpdateAnnouncementFormData) => {
      if (!announcement) throw new Error('اعلان انتخاب نشده است');

      const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در به‌روزرسانی اعلان');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      toast.success('اعلان با موفقیت به‌روزرسانی شد');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error('خطا در به‌روزرسانی اعلان', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: UpdateAnnouncementFormData) => {
    updateAnnouncementMutation.mutate(data);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onOpenChange(false);
    }
  };

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            ویرایش اعلان
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان اعلان *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="عنوان اعلان را وارد کنید"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">دسته‌بندی *</Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value as any)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full justify-end text-right">
                <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">عمومی</SelectItem>
                <SelectItem value="TECHNICAL">فنی</SelectItem>
                <SelectItem value="EVENT">رویداد</SelectItem>
                <SelectItem value="IMPORTANT">مهم</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">محتوای اعلان *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="محتوای اعلان را وارد کنید (از Markdown پشتیبانی می‌شود)"
              rows={8}
              disabled={isSubmitting}
              className="resize-none"
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="text-xs text-gray-500">
              می‌توانید از Markdown برای فرمت‌بندی متن استفاده کنید
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="isPinned"
                checked={isPinned}
                onCheckedChange={(checked) => setValue('isPinned', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="isPinned">سنجاق کردن به بالای لیست</Label>
            </div>
          </div>

          {updateAnnouncementMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {updateAnnouncementMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی اعلان'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 ms-2" />
              لغو
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
