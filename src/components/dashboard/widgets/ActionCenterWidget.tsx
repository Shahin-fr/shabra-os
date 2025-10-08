'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, XCircle, Clock, User, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ManagerWidget } from '@/components/ui/PerfectWidget';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PendingRequest {
  id: string;
  type: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details?: Record<string, unknown>;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    roles: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  // Legacy fields for backward compatibility
  requestType?: string;
  title?: string;
  description?: string;
  requester?: {
    id: string;
    name: string;
    avatar?: string;
  };
  priority?: number;
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
    gcTime: 1000 * 60 * 5, // 5 minutes
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
      case 'LEAVE':
        return 'درخواست مرخصی';
      case 'OVERTIME':
        return 'درخواست اضافه کار';
      case 'EXPENSE_CLAIM':
        return 'درخواست هزینه';
      case 'GENERAL':
        return 'درخواست عمومی';
      default:
        return 'درخواست عمومی';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'LEAVE':
        return <Clock className="h-4 w-4" />;
      case 'OVERTIME':
        return <Clock className="h-4 w-4" />;
      case 'EXPENSE_CLAIM':
        return <FileText className="h-4 w-4" />;
      case 'GENERAL':
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
      <ManagerWidget
        title="مرکز اقدامات"
        priority={priority}
        className={className}
        loading={isLoading}
        error={error?.message}
        empty={!isLoading && safeRequests.length === 0}
        emptyMessage="هیچ درخواست در انتظاری وجود ندارد"
        emptyIcon={<CheckCircle className="h-8 w-8 text-status-success" />}
        headerAction={
          safeRequests.length > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-status-danger border border-status-danger text-status-danger-text text-sm font-vazirmatn font-medium">
              <AlertCircle className="h-4 w-4" />
              {safeRequests.length}
            </div>
          )
        }
      >
        {/* Requests List - Perfect Internal Composition */}
        <div className="space-y-3">
          {safeRequests.slice(0, isMobile ? 3 : 6).map((request, index) => (
            <motion.button
              key={request.id}
              onClick={() => handleRequestClick(request)}
              className="w-full group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-gray-200/50" dir="rtl">
                <div className="flex items-start gap-5">
                  {/* User Avatar - Perfect Circle with Status */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {request.user?.avatar ? (
                        <img
                          src={request.user.avatar}
                          alt={`${request.user.firstName} ${request.user.lastName}`}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-gray-100 shadow-sm">
                          <User className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      {/* Status Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 border-3 border-white shadow-sm">
                        <div className="w-full h-full rounded-full bg-yellow-300 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Request Content - Perfect Typography Hierarchy */}
                  <div className="flex-1 min-w-0 space-y-4">
                    {/* Request Type & Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-brand-pink border border-brand-pink shadow-sm">
                          {getRequestTypeIcon(request.requestType || request.type)}
                        </div>
                        <span className="text-base font-bold text-brand-pink-text font-vazirmatn text-right">
                          {getRequestTypeText(request.requestType || request.type)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 font-vazirmatn bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-right">
                        {formatDate(request.createdAt)}
                      </div>
                    </div>
                    
                    {/* User Name */}
                    <h4 className="font-bold text-gray-900 font-vazirmatn text-xl leading-tight text-right">
                      {request.user ? `${request.user.firstName} ${request.user.lastName}` : (request.requester?.name || 'نامشخص')}
                    </h4>
                    
                    {/* Request Description */}
                    <p className="text-base text-gray-600 font-vazirmatn line-clamp-2 leading-relaxed text-right">
                      {request.reason || request.description || 'بدون توضیح'}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 pt-2">
                      {request.leaveType && (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-brand-pink text-brand-pink-text border border-brand-pink font-vazirmatn text-right">
                          {request.leaveType}
                        </span>
                      )}
                      <span className="text-sm text-gray-500 font-vazirmatn bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-right">
                        در انتظار بررسی
                      </span>
                    </div>
                  </div>

                  {/* Action Arrow */}
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 group-hover:bg-brand-pink transition-all duration-200 group-hover:scale-110">
                    <ChevronRight className="h-6 w-6 text-gray-500 group-hover:text-brand-pink-text transition-colors duration-200" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Action Button - Perfect Call-to-Action */}
        {safeRequests.length > (isMobile ? 3 : 6) && (
          <div className="pt-6 border-t border-gray-200/50">
            <Link href="/admin/action-center">
              <Button
                variant="outline"
                className="w-full font-vazirmatn text-sm bg-white/50 hover:bg-white/80 border-gray-300/50 hover:border-gray-400/50 transition-all duration-200"
              >
                <span>مشاهده همه درخواست‌ها</span>
                <ChevronRight className="rtl:rotate-180 h-4 w-4 me-2" />
              </Button>
            </Link>
          </div>
        )}
      </ManagerWidget>

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
                  از: {selectedRequest.user ? `${selectedRequest.user.firstName} ${selectedRequest.user.lastName}` : (selectedRequest.requester?.name || 'نامشخص')}
                </p>
              </div>

              <div>
                <h5 className="font-vazirmatn font-medium text-gray-900 mb-2">
                  دلیل:
                </h5>
                <p className="text-sm text-gray-600 font-vazirmatn bg-gray-50 p-3 rounded-lg">
                  {selectedRequest.reason || selectedRequest.description || 'بدون توضیح'}
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
                  className="flex-1 bg-status-success hover:bg-status-success text-white font-vazirmatn"
                >
                  {approveMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 ms-2" />
                      تأیید
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                  variant="outline"
                  className="flex-1 border-status-danger text-status-danger-text hover:bg-status-danger font-vazirmatn"
                >
                  {rejectMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 ms-2" />
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
                className="flex-1 bg-status-success hover:bg-status-success text-white font-vazirmatn"
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
                className="flex-1 bg-status-danger hover:bg-status-danger text-white font-vazirmatn"
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
