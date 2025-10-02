'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  User,
  FileText,
  ChevronDown,
  AlertCircle,
  PartyPopper,
  CalendarDays,
  Receipt,
  Laptop,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getRelativeTime } from '@/lib/dateUtils';
import { ActionCenterService, ActionCenterRequest } from '@/services/action-center.service';

// TypeScript interface for inbox items
interface ActionableInboxItem {
  id: number;
  type: 'leave_request' | 'task_assignment' | 'project_approval' | 'budget_request' | 'equipment_request' | 'meeting_request' | 'training_request';
  title: string;
  description: string;
  employee: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  originalRequest?: ActionCenterRequest; // Keep reference to original request
}

// Icon mapping for different item types
const getTypeIcon = (type: ActionableInboxItem['type']) => {
  const iconProps = { className: 'h-4 w-4' };
  
  switch (type) {
    case 'leave_request':
      return <CalendarDays {...iconProps} />;
    case 'task_assignment':
      return <FileText {...iconProps} />;
    case 'project_approval':
      return <CheckCircle {...iconProps} />;
    case 'budget_request':
      return <Receipt {...iconProps} />;
    case 'equipment_request':
      return <Laptop {...iconProps} />;
    case 'meeting_request':
      return <MessageSquare {...iconProps} />;
    case 'training_request':
      return <GraduationCap {...iconProps} />;
    default:
      return <User {...iconProps} />;
  }
};

// Priority color mapping
const getPriorityColor = (priority: ActionableInboxItem['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-status-danger text-status-danger-text border-status-danger';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-status-success text-status-success-text border-status-success';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Priority text in Persian
const getPriorityText = (priority: ActionableInboxItem['priority']) => {
  switch (priority) {
    case 'high':
      return 'بالا';
    case 'medium':
      return 'متوسط';
    case 'low':
      return 'پایین';
    default:
      return 'نامشخص';
  }
};

// Loading skeleton component
const InboxItemSkeleton = () => (
  <div className='p-3 rounded-xl bg-white/5 border border-white/10'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3 flex-1'>
        <Skeleton className='w-6 h-6 rounded-full' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Skeleton className='w-6 h-6 rounded-full' />
        <Skeleton className='w-6 h-6 rounded-full' />
        <Skeleton className='w-4 h-4' />
      </div>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className='text-center py-8 space-y-4'>
    <div className='w-16 h-16 bg-status-danger rounded-full flex items-center justify-center mx-auto'>
      <AlertCircle className='h-8 w-8 text-status-danger-text' />
    </div>
    <div className='space-y-2'>
      <h3 className='text-lg font-semibold text-gray-900'>خطا در بارگذاری</h3>
      <p className='text-sm text-gray-600'>متأسفانه در بارگذاری درخواست‌ها خطایی رخ داده است.</p>
    </div>
    <Button variant='outline' size='sm' onClick={onRetry}>
      تلاش مجدد
    </Button>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className='text-center py-8 space-y-4'>
    <div className='w-16 h-16 bg-status-success rounded-full flex items-center justify-center mx-auto'>
      <PartyPopper className='h-8 w-8 text-status-success-text' />
    </div>
    <div className='space-y-2'>
      <h3 className='text-lg font-semibold text-gray-900'>همه چیز مرتب است!</h3>
      <p className='text-sm text-gray-600'>در حال حاضر هیچ درخواست فوری برای بررسی وجود ندارد.</p>
    </div>
  </div>
);

export function ActionableInbox() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // Fetch actionable inbox items
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['actionableInbox'],
    queryFn: async () => {
      const response = await ActionCenterService.getActionableRequests({
        status: 'PENDING', // Only fetch pending requests for actionable inbox
      });
      
      // Transform the response to match the component's expected format
      const transformedData = response.requests.map(request => 
        ActionCenterService.transformToActionableInboxItem(request)
      );
      
      return {
        data: transformedData,
        success: true,
        message: 'Actionable inbox items fetched successfully',
        originalResponse: response, // Keep original response for reference
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });

  const toggleExpanded = (itemId: number) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleApprove = async (itemId: number) => {
    try {
      // Find the original request from the data
      const item = data?.data?.find(item => item.id === itemId);
      if (!item?.originalRequest) {
        // Original request not found
        return;
      }

      await ActionCenterService.processRequest(item.originalRequest.id, 'APPROVE');
      
      // Refetch data to update the UI
      refetch();
      
      // Request approved successfully
    } catch (error) {
      // Handle error silently
      // You might want to show a toast notification here
    }
  };

  const handleReject = async (itemId: number) => {
    try {
      // Find the original request from the data
      const item = data?.data?.find(item => item.id === itemId);
      if (!item?.originalRequest) {
        // Original request not found
        return;
      }

      // For now, we'll use a simple rejection reason
      // In a real app, you might want to show a modal for the rejection reason
      const rejectionReason = 'درخواست رد شد';
      
      await ActionCenterService.processRequest(item.originalRequest.id, 'REJECT', rejectionReason);
      
      // Refetch data to update the UI
      refetch();
      
      // Request rejected successfully
    } catch (error) {
      // Handle error silently
      // You might want to show a toast notification here
    }
  };

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className='backdrop-blur-sm bg-white/5 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-3 text-xl font-bold'>
            <div className='w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center'>
              <AlertTriangle className='h-5 w-5 text-[#ff0a54]' />
            </div>
            اقدامات فوری
            {!isLoading && !isError && (
              <Badge className='ms-auto bg-[#ff0a54] hover:bg-[#ff0a54]/90'>
                {data?.data?.length || 0}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* Loading State */}
          {isLoading && (
            <div className='space-y-3'>
              {Array.from({ length: 4 }).map((_, index) => (
                <InboxItemSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <ErrorState onRetry={() => refetch()} />
          )}

          {/* Empty State */}
          {!isLoading && !isError && data?.data?.length === 0 && (
            <EmptyState />
          )}

          {/* Data State */}
          {!isLoading && !isError && data?.data && data.data.length > 0 && (
            <>
              {data.data.map((item, index) => {
                const isExpanded = expandedItems.includes(item.id);

                return (
                  <OptimizedMotion
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className='group p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer'
                    onClick={() => toggleExpanded(item.id)}
                  >
                    {/* Main Content - Always Visible */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3 flex-1'>
                        <div className='w-6 h-6 bg-[#ff0a54]/20 rounded-full flex items-center justify-center group-hover:bg-[#ff0a54]/30 transition-colors'>
                          {getTypeIcon(item.type as ActionableInboxItem['type'])}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h4 className='font-semibold text-foreground group-hover:text-[#ff0a54] transition-colors text-sm'>
                            {item.title}
                          </h4>
                          <p className='text-xs text-muted-foreground mt-1'>
                            {item.employee}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        {/* Action Buttons */}
                        <Button
                          size='sm'
                          className='w-6 h-6 p-0 bg-status-success hover:bg-status-success text-white rounded-full'
                          onClick={e => {
                            e.stopPropagation();
                            handleApprove(item.id);
                          }}
                        >
                          <CheckCircle className='h-3 w-3' />
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          className='w-6 h-6 p-0 rounded-full'
                          onClick={e => {
                            e.stopPropagation();
                            handleReject(item.id);
                          }}
                        >
                          <X className='h-3 w-3' />
                        </Button>

                        {/* Expand/Collapse Icon */}
                        <OptimizedMotion
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className='h-4 w-4 text-muted-foreground' />
                        </OptimizedMotion>
                      </div>
                    </div>

                    {/* Expanded Content - Hidden by Default */}
                    <AnimatePresence>
                      {isExpanded && (
                        <OptimizedMotion
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className='mt-3 pt-3 border-t border-white/10'
                        >
                          <p className='text-sm text-muted-foreground mb-2'>
                            {item.description}
                          </p>
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className={`text-xs ${getPriorityColor(item.priority)}`}
                            >
                              {getPriorityText(item.priority)}
                            </Badge>
                            <span className='text-xs text-muted-foreground flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              {getRelativeTime(item.timestamp)}
                            </span>
                          </div>
                        </OptimizedMotion>
                      )}
                    </AnimatePresence>
                  </OptimizedMotion>
                );
              })}

              <OptimizedMotion
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='pt-4 border-t border-white/10'
              >
                <Button
                  variant='outline'
                  className='w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 text-sm'
                >
                  مشاهده همه درخواست‌ها
                </Button>
              </OptimizedMotion>
            </>
          )}
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

