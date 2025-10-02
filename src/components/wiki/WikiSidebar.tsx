'use client';

import { FileText, Plus, Upload, Search, AlertCircle } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWikiItems, useReorderWikiItems, useDeleteWikiItem, type WikiItem } from '@/stores/wiki.store';
import { SortableWikiItem } from './SortableWikiItem';
import { useToast } from '@/components/ui/toast';
import { CreateWikiItem } from './CreateWikiItem';
import { WikiFileUpload } from './WikiFileUpload';
import { EditWikiItem } from './EditWikiItem';

interface WikiSidebarProps {
  onDocumentSelect: (documentId: string | null) => void;
  selectedDocument: string | null;
  onRefresh?: () => void;
}

export function WikiSidebar({
  onDocumentSelect,
  selectedDocument,
  onRefresh,
}: WikiSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<WikiItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<WikiItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const { addToast } = useToast();
  const { data: wikiItems = [], isLoading, error, refetch } = useWikiItems();
  const reorderMutation = useReorderWikiItems();
  const deleteMutation = useDeleteWikiItem();

  // Get current user ID
  React.useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user?.id) {
          setCurrentUserId(data.user.id);
        }
      })
      .catch(error => {
        console.error('Error fetching current user:', error);
      });
  }, []);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleRefresh = () => {
    refetch();
    if (onRefresh) {
      onRefresh();
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = wikiItems.findIndex((item) => item.id === active.id);
      const newIndex = wikiItems.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(wikiItems, oldIndex, newIndex);
        
        // Transform to the format expected by the API
        const reorderData = newItems.map((item, index) => ({
          id: item.id,
          order: index
        }));
        
        reorderMutation.mutate(
          reorderData,
          {
            onSuccess: () => {
              addToast({
                title: 'موفقیت',
                description: 'ترتیب آیتم‌ها به‌روزرسانی شد',
                variant: 'success',
              });
            },
            onError: (error) => {
              addToast({
                title: 'خطا',
                description: error.message || 'خطا در تغییر ترتیب آیتم‌ها',
                variant: 'destructive',
              });
            },
          }
        );
      }
    }
  };

  const handleEdit = (item: WikiItem) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleDelete = (item: WikiItem) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    deleteMutation.mutate(deletingItem.id, {
      onSuccess: () => {
        addToast({
          title: 'موفقیت',
          description: 'آیتم با موفقیت حذف شد',
          variant: 'success',
        });
        setShowDeleteDialog(false);
        setDeletingItem(null);
        handleRefresh();
      },
      onError: (error) => {
        addToast({
          title: 'خطا',
          description: error.message || 'خطا در حذف آیتم',
          variant: 'destructive',
        });
      },
    });
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return wikiItems;
    
    const query = searchQuery.toLowerCase();
    return wikiItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      (item.children && item.children.some(child => 
        child.title.toLowerCase().includes(query)
      ))
    );
  }, [wikiItems, searchQuery]);

  if (isLoading) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            خطا در بارگذاری آیتم‌ها: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">ویکی</h2>
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ایجاد آیتم جدید</DialogTitle>
                </DialogHeader>
                <CreateWikiItem
                  onSuccess={() => {
                    setShowCreateDialog(false);
                    handleRefresh();
                  }}
                  onClose={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>آپلود فایل</DialogTitle>
                </DialogHeader>
                <WikiFileUpload
                  onSuccess={() => {
                    setShowUploadDialog(false);
                    handleRefresh();
                  }}
                  onClose={() => setShowUploadDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="جستجو در ویکی..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <SortableWikiItem
                  key={item.id}
                  item={item}
                  level={0}
                  onSelect={onDocumentSelect}
                  selectedDocument={selectedDocument}
                  expandedFolders={expandedFolders}
                  onToggleFolder={toggleFolder}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {filteredItems.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>هیچ آیتمی یافت نشد</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش آیتم</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <EditWikiItem
              document={editingItem}
              onClose={() => {
                setShowEditDialog(false);
                setEditingItem(null);
              }}
              onSuccess={() => {
                setShowEditDialog(false);
                setEditingItem(null);
                handleRefresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف آیتم</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید "{deletingItem?.title}" را حذف کنید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}