'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  X, 
  Trash2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface DeleteAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteAnnouncementModal({ 
  open, 
  onOpenChange, 
  announcement,
  onConfirm,
  isLoading
}: DeleteAnnouncementModalProps) {
  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            حذف اعلان
          </DialogTitle>
        </DialogHeader>

        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              آیا مطمئن هستید که می‌خواهید این اعلان را حذف کنید؟ این عمل قابل بازگشت نیست.
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">{announcement.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {announcement.content}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              نویسنده: {announcement.author.firstName} {announcement.author.lastName}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isLoading ? 'در حال حذف...' : 'حذف اعلان'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 ml-2" />
              لغو
            </Button>
          </div>
        </OptimizedMotion>
      </DialogContent>
    </Dialog>
  );
}
