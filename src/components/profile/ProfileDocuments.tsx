'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  AlertCircle,
  Loader2,
  // CheckCircle,
  // X,
  File,
  Image,
  FileSpreadsheet,
  FileType,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert'; // Removed unused imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface Document {
  id: string;
  name: string;
  url: string;
  fileType: string;
  category: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface DocumentsResponse {
  success: boolean;
  documents: Record<string, Document[]>;
  totalCount: number;
}

const DOCUMENT_CATEGORIES = {
  CONTRACT: 'قرارداد',
  IDENTIFICATION: 'شناسنامه',
  CERTIFICATE: 'گواهی',
  PERFORMANCE_REVIEW: 'ارزیابی عملکرد',
  MEDICAL: 'پزشکی',
  PAYROLL: 'حقوق',
  OTHER: 'سایر',
};

const FILE_TYPE_ICONS = {
  PDF: FileText,
  IMAGE: Image,
  DOCUMENT: File,
  SPREADSHEET: FileSpreadsheet,
  TEXT: FileType,
  DEFAULT: File,
};

const getFileIcon = (fileType: string) => {
  const IconComponent = FILE_TYPE_ICONS[fileType as keyof typeof FILE_TYPE_ICONS] || FILE_TYPE_ICONS.DEFAULT;
  return IconComponent;
};

interface ProfileDocumentsProps {
  userId: string;
}

export function ProfileDocuments({ userId }: ProfileDocumentsProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentCategory, setDocumentCategory] = useState('');

  const queryClient = useQueryClient();

  // Fetch documents
  const {
    data: documentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['documents', userId],
    queryFn: async (): Promise<DocumentsResponse> => {
      const response = await fetch(`/api/admin/documents?userId=${userId}`);
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('شما باید وارد سیستم شوید تا بتوانید اسناد را مشاهده کنید');
        } else if (response.status === 403) {
          throw new Error('شما دسترسی لازم برای مشاهده این اسناد را ندارید');
        } else if (response.status === 404) {
          throw new Error('کاربر مورد نظر یافت نشد');
        } else {
          throw new Error(`خطا در بارگذاری اسناد: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      return data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });


  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('سند با موفقیت آپلود شد');
      queryClient.invalidateQueries({ queryKey: ['documents', userId] });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentName('');
      setDocumentCategory('');
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast.error(`خطا در آپلود سند: ${error.message}`);
      setUploadProgress(0);
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('سند با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['documents', userId] });
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف سند: ${error.message}`);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentName(file.name.split('.')[0] || ''); // Set default name without extension
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName || !documentCategory) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', userId);
    formData.append('name', documentName);
    formData.append('category', documentCategory);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
    }
  };

  const handleDelete = (documentId: string, documentName: string) => {
    if (typeof window !== 'undefined' && window.confirm(`آیا مطمئن هستید که می‌خواهید سند "${documentName}" را حذف کنید؟`)) {
      deleteMutation.mutate(documentId);
    }
  };

  const handleDownload = (url: string, name: string) => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="me-3 text-gray-600">در حال بارگذاری اسناد...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            خطا در بارگذاری اسناد
          </h3>
          <p className="text-gray-600 text-center mb-4">
            {error instanceof Error ? error.message : 'متأسفانه خطایی در بارگذاری اسناد رخ داده است.'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  const documents = documentsData?.documents || {};
  const totalCount = documentsData?.totalCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مدیریت اسناد</h2>
          <p className="text-gray-600">
            {totalCount} سند موجود
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button">
              <Plus className="h-4 w-4 me-2" />
              آپلود سند جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>آپلود سند جدید</DialogTitle>
              <DialogDescription>
                سند جدید را انتخاب کنید و اطلاعات آن را وارد کنید.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">فایل</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.txt"
                  className="mt-1"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    انتخاب شده: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="name">نام سند</Label>
                <Input
                  id="name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="نام سند را وارد کنید"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">دسته‌بندی</Label>
                <Select value={documentCategory} onValueChange={setDocumentCategory}>
                  <SelectTrigger className="mt-1 w-full justify-end text-right">
                    <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_CATEGORIES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>در حال آپلود...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
              <div className="flex justify-end rtl:justify-start space-x-2 rtl:space-x-reverse space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || !documentName || !documentCategory || uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 me-2" />
                  )}
                  آپلود
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents List */}
      {totalCount === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              هیچ سندی یافت نشد
            </h3>
            <p className="text-gray-600 text-center mb-4">
              هنوز هیچ سندی برای این کاربر آپلود نشده است.
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              آپلود اولین سند
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(documents).map(([category, categoryDocuments]) => (
            <OptimizedMotion
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#ff0a54]" />
                    {DOCUMENT_CATEGORIES[category as keyof typeof DOCUMENT_CATEGORIES] || category}
                    <Badge variant="secondary">
                      {categoryDocuments.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryDocuments.map((document) => {
                      const FileIcon = getFileIcon(document.fileType);
                      return (
                        <div
                          key={document.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <FileIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {document.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                آپلود شده توسط: {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(document.createdAt).toLocaleDateString('fa-IR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(document.url, document.name)}
                            >
                              <Download className="h-4 w-4 me-2" />
                              دانلود
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(document.id, document.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 me-2" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </OptimizedMotion>
          ))}
        </div>
      )}
    </div>
  );
}
