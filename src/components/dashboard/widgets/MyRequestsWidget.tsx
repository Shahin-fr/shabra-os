'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Request {
  id: string;
  type: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface MyRequestsWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function MyRequestsWidget({ className, variant = 'desktop' }: MyRequestsWidgetProps) {
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['requests', 'my'],
    queryFn: async (): Promise<Request[]> => {
      const response = await fetch('/api/requests');
      
      if (!response.ok) {
        // const errorText = await response.text();
        throw new Error('Failed to fetch requests');
      }
      
      const data = await response.json();
      return data.data || [];
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'در انتظار';
      case 'APPROVED':
        return 'تأیید شده';
      case 'REJECTED':
        return 'رد شده';
      default:
        return 'نامشخص';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'LEAVE_REQUEST':
        return 'درخواست مرخصی';
      case 'EXPENSE_REQUEST':
        return 'درخواست هزینه';
      case 'EQUIPMENT_REQUEST':
        return 'درخواست تجهیزات';
      case 'TRAINING_REQUEST':
        return 'درخواست آموزش';
      default:
        return 'درخواست عمومی';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const recentRequests = requests?.slice(0, 3) || [];
  const pendingCount = requests?.filter(req => req.status === 'PENDING').length || 0;

  const isMobile = variant === 'mobile';

  return (
    <WidgetCard
      title="درخواست‌های من"
      className={cn(
        'bg-gradient-to-br from-orange-50 to-amber-50',
        className
      )}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && requests?.length === 0}
      emptyMessage="هیچ درخواستی ارسال نکرده‌اید"
      emptyIcon={<FileText className="h-8 w-8 text-orange-400" />}
    >
      {/* Pending Count Badge */}
      {pendingCount > 0 && (
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-vazirmatn">
            <Clock className="h-4 w-4" />
            {pendingCount} درخواست در انتظار
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {recentRequests.map((request) => (
          <div
            key={request.id}
            className="p-3 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200"
          >
            <div className="flex items-start rtl:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'font-vazirmatn font-medium text-gray-900 leading-tight',
                  isMobile ? 'text-sm' : 'text-base'
                )}>
                  {getTypeText(request.type)}
                </h4>
                <p className={cn(
                  'text-gray-600 font-vazirmatn mt-1 line-clamp-2',
                  isMobile ? 'text-xs' : 'text-sm'
                )}>
                  {request.reason}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    'text-xs font-vazirmatn text-gray-500',
                    isMobile && 'text-xs'
                  )}>
                    {formatDate(request.createdAt)}
                  </span>
                </div>
              </div>
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-vazirmatn font-medium',
                getStatusColor(request.status)
              )}>
                {getStatusIcon(request.status)}
                {getStatusText(request.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {requests && requests.length > 0 && (
        <div className="pt-4 border-t border-white/40">
          <Button
            variant="outline"
            className="w-full font-vazirmatn text-sm"
            onClick={() => {
              // Navigate to requests page
              window.location.href = '/requests';
            }}
          >
            مشاهده همه درخواست‌ها
          </Button>
        </div>
      )}

      {/* Quick Action */}
      <div className="pt-2">
        <Button
          className="w-full font-vazirmatn text-sm bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => {
            // Navigate to create request page
            window.location.href = '/requests/new';
          }}
        >
          درخواست جدید
        </Button>
      </div>
    </WidgetCard>
  );
}
