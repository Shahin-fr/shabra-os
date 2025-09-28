'use client';

import { useState } from 'react';
import { Download, ExternalLink, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
}

export function PDFViewer({ fileUrl, fileName, fileSize }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {fileName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              دانلود
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              باز کردن در تب جدید
            </Button>
          </div>
        </div>
        {fileSize && (
          <p className="text-sm text-gray-500">
            حجم فایل: {formatFileSize(fileSize)}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] border border-gray-200 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">در حال بارگذاری PDF...</p>
              </div>
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-sm text-red-500 mb-2">
                  خطا در بارگذاری PDF
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                >
                  تلاش مجدد
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              title={fileName}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
