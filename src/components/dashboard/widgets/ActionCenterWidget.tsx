'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, XCircle, Clock, User, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedWidgetCard } from '@/components/ui/EnhancedWidgetCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PendingRequest {
  id: string;
  type: string;
  requestType?: string;
  title: string;
  description: string;
  requester: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  priority: number;
  // Leave request specific
  leaveType?: string;
  startDate?: string;
  endDate?: string;
}

interface ActionCenterWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
  priority?: 'high' | 'medium' | 'low';
}

export const ActionCenterWidget = React.memo(function ActionCenterWidget({ className, variant = 'desktop', priority = 'high' }: ActionCenterWidgetProps) {
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const { data: actionCenterData, isLoading, error } = useQuery({
    queryKey: ['admin', 'action-center'],
    queryFn: async () => {
      const response = await fetch('/api/admin/action-center');
      if (!response.ok) {
        throw new Error('Failed to fetch action center data');
      }
      const data = await response.json();
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - action center changes frequently
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const requests = actionCenterData?.requests || [];

  const approveMutation = useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      const response = await fetch(`/api/admin/action-center/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'APPROVE',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve request');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'action-center'] });
      setIsModalOpen(false);
      setSelectedRequest(null);
      toast.success('درخواست با موفقیت تایید شد');
    },
    onError: (error: Error) => {
      console.error('Approve error:', error);
      toast.error(`خطا در تایید درخواست: ${error.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, rejectionReason }: { requestId: string; rejectionReason: string }) => {
      const response = await fetch(`/api/admin/action-center/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject request');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'action-center'] });
      setIsModalOpen(false);
      setSelectedRequest(null);
      toast.success('درخواست با موفقیت رد شد');
    },
    onError: (error: Error) => {
      console.error('Reject error:', error);
      toast.error(`خطا در رد درخواست: ${error.message}`);
    },
  });

  const handleRequestClick = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    setShowApproveDialog(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedRequest) return;
    approveMutation.mutate({
      requestId: selectedRequest.id,
    });
    setShowApproveDialog(false);
  };

  const handleCancelApprove = () => {
    setShowApproveDialog(false);
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    setShowRejectDialog(true);
  };

  const handleConfirmReject = () => {
    if (!selectedRequest || !rejectionReason.trim()) return;
    rejectMutation.mutate({
      requestId: selectedRequest.id,
      rejectionReason: rejectionReason.trim(),
    });
    setShowRejectDialog(false);
    setRejectionReason('');
  };

  const handleCancelReject = () => {
    setShowRejectDialog(false);
    setRejectionReason('');
  };

  const getRequestTypeText = (type: string) => {
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

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'LEAVE_REQUEST':
        return <Clock className="h-4 w-4" />;
      case 'EXPENSE_REQUEST':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMobile = variant === 'mobile';
  
  // Safety check to ensure requests is always an array
  const safeRequests = Array.isArray(requests) ? requests : [];

  return (
    <>
      <EnhancedWidgetCard
        title="مرکز اقدامات"
        variant="manager"
        priority={priority}
        className={className}
        loading={isLoading}
        error={error?.message}
        empty={!isLoading && safeRequests.length === 0}
        emptyMessage="هیچ درخواست در انتظاری وجود ندارد"
        emptyIcon={<CheckCircle className="h-8 w-8 text-green-400" />}
        headerAction={
          safeRequests.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-vazirmatn font-medium">
              <AlertCircle className="h-3 w-3" />
              {safeRequests.length}
            </div>
          )
        }
      >
        {/* Requests List */}
        <div className="space-y-3">
          {safeRequests.slice(0, isMobile ? 3 : 6).map((request) => (
            <button
              key={request.id}
              onClick={() => handleRequestClick(request)}
              className="w-full p-3 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200 text-right"
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {request.requester?.avatar ? (
                    <img
                      src={request.requester.avatar}
                      alt={request.requester.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Request Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getRequestTypeIcon(request.requestType || request.type)}
                    <span className="font-vazirmatn font-medium text-gray-900 text-sm">
                      {getRequestTypeText(request.requestType || request.type)}
                    </span>
                  </div>
                  
                  <h4 className={cn(
                    'font-vazirmatn font-semibold text-gray-900 leading-tight',
                    isMobile ? 'text-sm' : 'text-base'
                  )}>
                    {request.requester?.name || 'نامشخص'}
                  </h4>
                  
                  <p className={cn(
                    'text-gray-600 font-vazirmatn mt-1 line-clamp-2',
                    isMobile ? 'text-xs' : 'text-sm'
                  )}>
                    {request.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500 font-vazirmatn">
                      {formatDate(request.createdAt)}
                    </span>
                    {request.leaveType && (
                      <span className="text-xs text-blue-600 font-vazirmatn">
                        {request.leaveType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Indicator */}
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Action Button - Only show if more than max items */}
        {safeRequests.length > (isMobile ? 3 : 6) && (
          <div className="pt-4 border-t border-white/40">
            <Link href="/admin/action-center">
              <Button
                variant="outline"
                className="w-full font-vazirmatn text-sm hover:bg-white/80"
              >
                <span>مشاهده همه درخواست‌ها</span>
                <ChevronRight className="h-4 w-4 mr-2" />
              </Button>
            </Link>
          </div>
        )}
      </EnhancedWidgetCard>

      {/* Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 font-vazirmatn">
                بررسی درخواست
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-vazirmatn font-medium text-gray-900">
                  {getRequestTypeText(selectedRequest.type)}
                </h4>
                <p className="text-sm text-gray-600 font-vazirmatn">
                  از: {selectedRequest.requester?.name || 'نامشخص'}
                </p>
              </div>

              <div>
                <h5 className="font-vazirmatn font-medium text-gray-900 mb-2">
                  دلیل:
                </h5>
                <p className="text-sm text-gray-600 font-vazirmatn bg-gray-50 p-3 rounded-lg">
                  {selectedRequest.description}
                </p>
              </div>

              {selectedRequest.leaveType && (
                <div>
                  <h5 className="font-vazirmatn font-medium text-gray-900 mb-2">
                    نوع مرخصی:
                  </h5>
                  <p className="text-sm text-gray-600 font-vazirmatn">
                    {selectedRequest.leaveType}
                  </p>
                </div>
              )}

              {selectedRequest.startDate && selectedRequest.endDate && (
                <div>
                  <h5 className="font-vazirmatn font-medium text-gray-900 mb-2">
                    تاریخ:
                  </h5>
                  <p className="text-sm text-gray-600 font-vazirmatn">
                    {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-vazirmatn"
                >
                  {approveMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 ml-2" />
                      تأیید
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-50 font-vazirmatn"
                >
                  {rejectMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 ml-2" />
                      رد
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Dialog */}
      {showApproveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-vazirmatn font-semibold text-gray-900 mb-4">
              تایید درخواست
            </h3>
            <p className="text-sm text-gray-600 font-vazirmatn mb-4">
              آیا مطمئن هستید که می‌خواهید این درخواست را تایید کنید؟
            </p>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleConfirmApprove}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-vazirmatn"
              >
                {approveMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'تایید درخواست'
                )}
              </Button>
              <Button
                onClick={handleCancelApprove}
                variant="outline"
                className="flex-1 font-vazirmatn"
              >
                انصراف
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-vazirmatn font-semibold text-gray-900 mb-4">
              رد درخواست
            </h3>
            <p className="text-sm text-gray-600 font-vazirmatn mb-4">
              لطفاً دلیل رد درخواست را وارد کنید:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="دلیل رد درخواست..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 font-vazirmatn text-sm"
              dir="rtl"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-vazirmatn"
              >
                {rejectMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'رد درخواست'
                )}
              </Button>
              <Button
                onClick={handleCancelReject}
                variant="outline"
                className="flex-1 font-vazirmatn"
              >
                انصراف
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
