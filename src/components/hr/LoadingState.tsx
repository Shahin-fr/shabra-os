import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingMessage?: string;
  errorMessage?: string;
  children: React.ReactNode;
}

export function LoadingState({
  isLoading,
  error,
  onRetry,
  loadingMessage = 'در حال بارگذاری...',
  errorMessage = 'خطا در بارگذاری داده‌ها',
  children,
}: LoadingStateProps) {
  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            {errorMessage}
          </h3>
          <p className='text-gray-600 text-center mb-4'>
            {error.message}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant='outline'>
              <RefreshCw className='h-4 w-4 mr-2' />
              تلاش مجدد
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-[#ff0a54] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
