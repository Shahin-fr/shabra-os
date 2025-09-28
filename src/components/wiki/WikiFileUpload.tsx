'use client';

import { Upload, FileText, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUploadWikiFile } from '@/stores/wiki.store';
import { useToast } from '@/components/ui/toast';

interface WikiFileUploadProps {
  onClose: () => void;
  onSuccess: () => void;
  parentId?: string | null;
}

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  message: string;
}

export function WikiFileUpload({ onClose, onSuccess, parentId }: WikiFileUploadProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addToast } = useToast();
  const uploadMutation = useUploadWikiFile();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isMarkdown = fileExtension === 'md' || fileExtension === 'markdown';
      const isPdf = fileExtension === 'pdf';

      if (!isMarkdown && !isPdf) {
        setUploadStatus({
          status: 'error',
          progress: 0,
          message: 'Only PDF and Markdown files are allowed',
        });
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setUploadStatus({
          status: 'error',
          progress: 0,
          message: 'File size must be less than 10MB',
        });
        return;
      }

      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove extension for default title
      setUploadStatus({
        status: 'idle',
        progress: 0,
        message: '',
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      addToast({
        title: 'خطا',
        description: 'لطفاً فایل را انتخاب کنید و عنوان را وارد کنید',
        variant: 'destructive',
      });
      return;
    }

    setUploadStatus({
      status: 'uploading',
      progress: 0,
      message: 'در حال آپلود...',
    });

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim());
    if (parentId) {
      formData.append('parentId', parentId);
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadStatus(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90),
      }));
    }, 200);

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        clearInterval(progressInterval);
        setUploadStatus({
          status: 'success',
          progress: 100,
          message: 'فایل با موفقیت آپلود شد!',
        });

        // Reset form after success
        setTimeout(() => {
          setSelectedFile(null);
          setTitle('');
          setUploadStatus({
            status: 'idle',
            progress: 0,
            message: '',
          });
          onSuccess();
        }, 1500);
      },
      onError: (error) => {
        clearInterval(progressInterval);
        setUploadStatus({
          status: 'error',
          progress: 0,
          message: error.message || 'آپلود ناموفق',
        });
        addToast({
          title: 'خطا',
          description: error.message || 'خطا در آپلود فایل',
          variant: 'destructive',
        });
      },
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setTitle('');
    setUploadStatus({
      status: 'idle',
      progress: 0,
      message: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension === 'pdf') {
      return <File className="h-8 w-8 text-red-500" />;
    }
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">انتخاب فایل</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              انتخاب فایل
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.md,.markdown"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="text-sm text-gray-500">
              PDF, Markdown (.md, .markdown)
            </span>
          </div>
        </div>

        {selectedFile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">عنوان مستند</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان مستند را وارد کنید..."
            disabled={uploadMutation.isPending}
          />
        </div>

        {uploadStatus.status !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {uploadStatus.status === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {uploadStatus.status === 'error' && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">{uploadStatus.message}</span>
            </div>
            {uploadStatus.status === 'uploading' && (
              <Progress value={uploadStatus.progress} className="w-full" />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={uploadMutation.isPending}
        >
          انصراف
        </Button>
        <Button
          type="button"
          onClick={handleUpload}
          disabled={
            !selectedFile ||
            !title.trim() ||
            uploadMutation.isPending ||
            uploadStatus.status === 'success'
          }
        >
          {uploadMutation.isPending ? 'در حال آپلود...' : 'آپلود فایل'}
        </Button>
      </div>
    </div>
  );
}
