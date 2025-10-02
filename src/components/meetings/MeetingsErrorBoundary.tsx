'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface MeetingsErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface MeetingsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class MeetingsErrorBoundary extends React.Component<
  MeetingsErrorBoundaryProps,
  MeetingsErrorBoundaryState
> {
  constructor(props: MeetingsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MeetingsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Meetings Error Boundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would typically send to an error reporting service
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              خطا در نمایش جلسات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                متأسفانه در نمایش جلسات مشکلی پیش آمده است
              </h3>
              
              <p className="text-red-700 mb-6">
                لطفاً صفحه را مجدداً بارگذاری کنید یا به صفحه اصلی بازگردید.
              </p>

              {this.state.error && (
                <details className="text-sm text-red-600 mb-4 text-right">
                  <summary className="cursor-pointer font-medium mb-2">
                    جزئیات خطا
                  </summary>
                  <div className="bg-red-100 p-3 rounded-lg text-xs font-mono text-left overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>خطا:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 ms-2" />
                  تلاش مجدد
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 ms-2" />
                  بارگذاری مجدد صفحه
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Home className="h-4 w-4 ms-2" />
                  صفحه اصلی
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <Bug className="h-4 w-4" />
                    <span className="font-medium">حالت توسعه</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    این خطا فقط در حالت توسعه نمایش داده می‌شود. در حالت تولید، 
                    کاربران پیام ساده‌تری خواهند دید.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
