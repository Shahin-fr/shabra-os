'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Send,
  Loader2,
  // AlertCircle,
  // CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// import { Alert, AlertDescription } from '@/components/ui/alert'; // Removed unused imports

interface RequestFormData {
  type: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details: any;
  reason: string;
}

const REQUEST_TYPES = [
  {
    value: 'LEAVE',
    label: 'مرخصی',
    icon: Calendar,
    description: 'درخواست مرخصی',
  },
  {
    value: 'OVERTIME',
    label: 'اضافه‌کار',
    icon: Clock,
    description: 'درخواست اضافه‌کار',
  },
  {
    value: 'EXPENSE_CLAIM',
    label: 'درخواست هزینه',
    icon: DollarSign,
    description: 'درخواست بازپرداخت هزینه',
  },
  {
    value: 'GENERAL',
    label: 'عمومی',
    icon: FileText,
    description: 'درخواست عمومی',
  },
];

const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'مرخصی سالانه' },
  { value: 'SICK', label: 'مرخصی استعلاجی' },
  { value: 'UNPAID', label: 'مرخصی بدون حقوق' },
  { value: 'EMERGENCY', label: 'مرخصی اضطراری' },
  { value: 'MATERNITY', label: 'مرخصی زایمان' },
  { value: 'PATERNITY', label: 'مرخصی پدری' },
  { value: 'STUDY', label: 'مرخصی تحصیلی' },
  { value: 'OTHER', label: 'سایر' },
];

const EXPENSE_CATEGORIES = [
  'حمل و نقل',
  'غذا و پذیرایی',
  'اقامت',
  'تجهیزات',
  'آموزش',
  'سایر',
];

const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'کم', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM', label: 'متوسط', color: 'bg-blue-100 text-blue-800' },
  { value: 'HIGH', label: 'بالا', color: 'bg-orange-100 text-orange-800' },
  { value: 'URGENT', label: 'فوری', color: 'bg-red-100 text-red-800' },
];

export function NewRequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RequestFormData>({
    type: 'LEAVE',
    details: {},
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error Response:', error);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Handle the standardized error response format
        const errorMessage = error.error?.message || error.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('درخواست با موفقیت ارسال شد');
      router.push('/requests');
    },
    onError: (error: Error) => {
      console.error('Request submission error:', error);
      toast.error(`خطا در ارسال درخواست: ${error.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type: type as any,
      details: {},
    }));
  };

  const handleDetailChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      toast.error('لطفاً دلیل درخواست را وارد کنید');
      return;
    }
    
    if (formData.reason.trim().length < 10) {
      toast.error('دلیل درخواست باید حداقل 10 کاراکتر باشد');
      return;
    }

    // Validate details based on type
    if (formData.type === 'LEAVE') {
      if (!formData.details.leaveType || !formData.details.startDate || !formData.details.endDate) {
        toast.error('لطفاً تمام فیلدهای مربوط به مرخصی را پر کنید');
        return;
      }
    } else if (formData.type === 'OVERTIME') {
      if (!formData.details.date || !formData.details.startTime || !formData.details.endTime) {
        toast.error('لطفاً تمام فیلدهای مربوط به اضافه‌کار را پر کنید');
        return;
      }
    } else if (formData.type === 'EXPENSE_CLAIM') {
      if (!formData.details.amount || !formData.details.category) {
        toast.error('لطفاً تمام فیلدهای مربوط به درخواست هزینه را پر کنید');
        return;
      }
    } else if (formData.type === 'GENERAL') {
      if (!formData.details.subject) {
        toast.error('لطفاً موضوع درخواست را وارد کنید');
        return;
      }
    }

    // Convert date strings to ISO datetime format for API
    const processedFormData = { ...formData };
    if (formData.type === 'LEAVE') {
      const startDate = new Date(formData.details.startDate);
      const endDate = new Date(formData.details.endDate);
      
      console.log('Original dates:', { 
        startDate: formData.details.startDate, 
        endDate: formData.details.endDate 
      });
      console.log('Converted dates:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });
      
      processedFormData.details = {
        ...formData.details,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    } else if (formData.type === 'OVERTIME') {
      const date = new Date(formData.details.date);
      console.log('Original overtime date:', formData.details.date);
      console.log('Converted overtime date:', date.toISOString());
      
      processedFormData.details = {
        ...formData.details,
        date: date.toISOString(),
      };
    }
    
    console.log('Processed form data:', JSON.stringify(processedFormData, null, 2));

    setIsSubmitting(true);
    createRequestMutation.mutate(processedFormData);
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'LEAVE':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leaveType">نوع مرخصی</Label>
              <Select
                value={formData.details.leaveType || ''}
                onValueChange={(value) => handleDetailChange('leaveType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع مرخصی" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاریخ شروع</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.details.startDate || ''}
                  onChange={(e) => handleDetailChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">تاریخ پایان</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.details.endDate || ''}
                  onChange={(e) => handleDetailChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'OVERTIME':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">تاریخ</Label>
              <Input
                id="date"
                type="date"
                value={formData.details.date || ''}
                onChange={(e) => handleDetailChange('date', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">ساعت شروع</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.details.startTime || ''}
                  onChange={(e) => handleDetailChange('startTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">ساعت پایان</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.details.endTime || ''}
                  onChange={(e) => handleDetailChange('endTime', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={formData.details.description || ''}
                onChange={(e) => handleDetailChange('description', e.target.value)}
                placeholder="توضیحات اضافی در مورد اضافه‌کار..."
              />
            </div>
          </div>
        );

      case 'EXPENSE_CLAIM':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">مبلغ</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.details.amount || ''}
                  onChange={(e) => handleDetailChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="مبلغ به تومان"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">واحد پول</Label>
                <Select
                  value={formData.details.currency || 'IRR'}
                  onValueChange={(value) => handleDetailChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IRR">تومان</SelectItem>
                    <SelectItem value="USD">دلار</SelectItem>
                    <SelectItem value="EUR">یورو</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">دسته‌بندی</Label>
              <Select
                value={formData.details.category || ''}
                onValueChange={(value) => handleDetailChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptUrl">لینک فیش (اختیاری)</Label>
              <Input
                id="receiptUrl"
                type="url"
                value={formData.details.receiptUrl || ''}
                onChange={(e) => handleDetailChange('receiptUrl', e.target.value)}
                placeholder="https://example.com/receipt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={formData.details.description || ''}
                onChange={(e) => handleDetailChange('description', e.target.value)}
                placeholder="توضیحات در مورد هزینه..."
              />
            </div>
          </div>
        );

      case 'GENERAL':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">موضوع</Label>
              <Input
                id="subject"
                value={formData.details.subject || ''}
                onChange={(e) => handleDetailChange('subject', e.target.value)}
                placeholder="موضوع درخواست"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">اولویت</Label>
              <Select
                value={formData.details.priority || 'MEDIUM'}
                onValueChange={(value) => handleDetailChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={formData.details.description || ''}
                onChange={(e) => handleDetailChange('description', e.target.value)}
                placeholder="توضیحات کامل درخواست..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>درخواست جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type Selection */}
            <div className="space-y-4">
              <Label>نوع درخواست</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REQUEST_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Button
                      key={type.value}
                      type="button"
                      onClick={() => handleTypeChange(type.value)}
                      variant={formData.type === type.value ? 'default' : 'outline'}
                      className="p-4 h-auto text-right justify-start"
                    >
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Type-specific fields */}
            {renderTypeSpecificFields()}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">دلیل درخواست *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="لطفاً دلیل درخواست خود را توضیح دهید..."
                required
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || createRequestMutation.isPending}
                variant="default"
              >
                {isSubmitting || createRequestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                ارسال درخواست
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}
