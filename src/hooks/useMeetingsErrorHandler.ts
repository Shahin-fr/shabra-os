import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorContext {
  operation: string;
  component?: string;
  additionalInfo?: Record<string, any>;
}

export function useMeetingsErrorHandler() {
  const handleError = useCallback((
    error: Error | unknown,
    context: ErrorContext,
    showToast: boolean = true
  ) => {
    const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log error for debugging
    console.error(`Meetings Error [${context.operation}]:`, {
      error: errorMessage,
      stack: errorStack,
      context,
      timestamp: new Date().toISOString(),
    });

    // Show user-friendly toast if requested
    if (showToast) {
      const userMessage = getUserFriendlyMessage(context.operation, errorMessage);
      toast.error(userMessage, {
        duration: 5000,
        action: {
          label: 'تلاش مجدد',
          onClick: () => {
            // This could trigger a retry mechanism
            window.location.reload();
          },
        },
      });
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // sendToErrorReportingService(error, context);
    }
  }, []);

  const handleApiError = useCallback((
    error: any,
    operation: string,
    showToast: boolean = true
  ) => {
    let errorMessage = 'خطا در ارتباط با سرور';
    
    if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    handleError(error, { operation }, showToast);
  }, [handleError]);

  const handleValidationError = useCallback((
    errors: any[],
    operation: string
  ) => {
    const errorMessages = errors.map(err => err.message).join(', ');
    toast.error(`خطا در اعتبارسنجی: ${errorMessages}`, {
      duration: 4000,
    });
  }, []);

  const handleNetworkError = useCallback((
    error: any,
    operation: string
  ) => {
    toast.error('خطا در اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید.', {
      duration: 5000,
      action: {
        label: 'تلاش مجدد',
        onClick: () => window.location.reload(),
      },
    });
  }, []);

  return {
    handleError,
    handleApiError,
    handleValidationError,
    handleNetworkError,
  };
}

function getUserFriendlyMessage(operation: string, errorMessage: string): string {
  const operationMessages: Record<string, string> = {
    'fetch-meetings': 'خطا در بارگذاری جلسات',
    'create-meeting': 'خطا در ایجاد جلسه',
    'update-meeting': 'خطا در به‌روزرسانی جلسه',
    'delete-meeting': 'خطا در حذف جلسه',
    'add-talking-point': 'خطا در اضافه کردن نکته گفتگو',
    'update-talking-point': 'خطا در به‌روزرسانی نکته گفتگو',
    'delete-talking-point': 'خطا در حذف نکته گفتگو',
    'add-action-item': 'خطا در اضافه کردن مورد اقدام',
    'update-action-item': 'خطا در به‌روزرسانی مورد اقدام',
    'delete-action-item': 'خطا در حذف مورد اقدام',
    'calendar-render': 'خطا در نمایش تقویم',
    'date-format': 'خطا در فرمت تاریخ',
    'permission-check': 'خطا در بررسی دسترسی',
  };

  return operationMessages[operation] || 'خطای غیرمنتظره رخ داده است';
}
