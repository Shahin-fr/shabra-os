'use client';

import { ChevronRight, ChevronDown, Folder, FileText, Plus, Upload, Search, AlertCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';
import { useWikiItems, useReorderWikiItems, useDeleteWikiItem, useUpdateWikiItem, type WikiItem } from '@/stores/wiki.store';
import { useToast } from '@/components/ui/toast';
import { CreateWikiItem } from './CreateWikiItem';
import { WikiFileUpload } from './WikiFileUpload';
import { EditWikiItem } from './EditWikiItem';

interface WikiSidebarProps {
  onDocumentSelect: (documentId: string | null) => void;
  selectedDocument: string | null;
  onRefresh?: () => void;
}

// Sortable item component
function SortableWikiItem({ 
  item, 
  level = 0, 
  onSelect, 
  selectedDocument, 
  expandedFolders, 
  onToggleFolder,
  onEdit,
  onDelete,
  currentUserId
}: {
  item: WikiItem;
  level: number;
  onSelect: (id: string) => void;
  selectedDocument: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  onEdit: (item: WikiItem) => void;
  onDelete: (item: WikiItem) => void;
  currentUserId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isExpanded = expandedFolders.has(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedDocument === item.id;
  const canEdit = currentUserId && item.authorId === currentUserId && !item.id?.startsWith('doc-');
  const isSystemDocument = item.id?.startsWith('doc-') || item.id === 'markdown-docs-folder';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isDragging && 'opacity-50 z-50'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-gray-100',
          isSelected && 'bg-pink-100 border border-pink-200',
          level > 0 && 'me-4'
        )}
      >
        {/* Drag handle - only for non-folder items */}
        {item.type !== 'FOLDER' && (
          <div
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
            {...attributes}
            {...listeners}
          >
            <div className="w-1 h-4 bg-gray-300 rounded"></div>
          </div>
        )}
        
        {/* Clickable content area */}
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => onSelect(item.id)}
        >
        {item.type === 'FOLDER' ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFolder(item.id);
              }}
              className='p-1 hover:bg-gray-200 rounded transition-colors'
            >
              {isExpanded ? (
                <ChevronDown className="rtl:rotate-180 h-4 w-4 text-gray-600 flex-shrink-0" />
              ) : (
                <ChevronRight className="rtl:rotate-180 h-4 w-4 text-gray-600 flex-shrink-0" />
              )}
            </button>
            <Folder className='h-4 w-4 text-blue-500 flex-shrink-0' />
          </>
        ) : (
          <FileText className='h-4 w-4 text-gray-600 flex-shrink-0' />
        )}

        <span className='truncate flex-1'>{item.title}</span>
        </div>

        {/* Edit/Delete Menu */}
        {canEdit && !isSystemDocument && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 me-2" />
                ویرایش
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(item)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 me-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {item.type === 'FOLDER' && isExpanded && hasChildren && (
        <div className='mt-1'>
          {item.children!.map(child => (
            <SortableWikiItem
              key={child.id}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              selectedDocument={selectedDocument}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
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

    if (!over || active.id === over.id) {
      return;
    }

    // Get the current items at the root level (no parent)
    const rootItems = filteredItems.filter(item => !item.parentId);
    const oldIndex = rootItems.findIndex(item => item.id === active.id);
    const newIndex = rootItems.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Create new order array
    const reorderedItems = arrayMove(rootItems, oldIndex, newIndex);
    const itemsWithOrder = reorderedItems.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    // Update the order in the database
    reorderMutation.mutate(itemsWithOrder, {
      onSuccess: () => {
        addToast({
          title: 'موفقیت',
          description: 'ترتیب آیتم‌ها به‌روزرسانی شد',
          variant: 'success',
        });
      },
      onError: (_error) => {
        addToast({
          title: 'خطا',
          description: 'خطا در تغییر ترتیب آیتم‌ها',
          variant: 'destructive',
        });
      },
    });
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return wikiItems;
    }

    const searchLower = searchQuery.toLowerCase();
    const filterItems = (items: WikiItem[]): WikiItem[] => {
      return items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchLower);
        const hasMatchingChildren = item.children ? filterItems(item.children).length > 0 : false;
        
        if (matchesSearch || hasMatchingChildren) {
          return {
            ...item,
            children: item.children ? filterItems(item.children) : undefined,
          };
        }
        return false;
      });
    };

    return filterItems(wikiItems);
  }, [wikiItems, searchQuery]);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    addToast({
      title: 'موفقیت',
      description: 'آیتم جدید با موفقیت ایجاد شد',
      variant: 'success',
    });
    handleRefresh();
  };

  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    addToast({
      title: 'موفقیت',
      description: 'فایل با موفقیت آپلود شد',
      variant: 'success',
    });
    handleRefresh();
  };

  const handleEdit = (item: WikiItem) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleDelete = (item: WikiItem) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
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
        // Check if it's a folder with children error
        if (error.message && error.message.includes('Cannot delete folder that contains')) {
          addToast({
            title: 'نمی‌توان پوشه را حذف کرد',
            description: 'ابتدا تمام آیتم‌های داخل این پوشه را حذف کنید یا آن‌ها را به جای دیگری منتقل کنید.',
            variant: 'destructive',
          });
        } else {
          addToast({
            title: 'خطا',
            description: error.message || 'خطا در حذف آیتم',
            variant: 'destructive',
          });
        }
      },
    });
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setEditingItem(null);
    addToast({
      title: 'موفقیت',
      description: 'آیتم با موفقیت به‌روزرسانی شد',
      variant: 'success',
    });
    handleRefresh();
  };


  if (isLoading) {
    return (
      <div className='w-full lg:w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl'>
        <div className='p-4'>
          <div className='animate-pulse space-y-3'>
            <div className='h-4 bg-muted rounded w-3/4'></div>
            <div className='h-4 bg-muted rounded w-1/2'></div>
            <div className='h-4 bg-muted rounded w-5/6'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full lg:w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl'>
        <div className='p-4'>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'خطا در بارگذاری آیتم‌های ویکی. لطفاً دوباره تلاش کنید.'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="mt-4 w-full"
          >
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full lg:w-80 h-full bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80 rounded-xl border border-gray-200/50 shadow-sm flex flex-col'>
      <div className='p-6 border-b border-gray-200/50'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-bold text-xl text-gray-800'>ساختار شبرالوگ</h2>
          <div className='flex items-center gap-2'>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 px-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ایجاد آیتم جدید</DialogTitle>
                </DialogHeader>
                <CreateWikiItem
                  onClose={() => setShowCreateDialog(false)}
                  onSuccess={handleCreateSuccess}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 px-2">
                  <Upload className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>آپلود فایل</DialogTitle>
                </DialogHeader>
                <WikiFileUpload
                  onClose={() => setShowUploadDialog(false)}
                  onSuccess={handleUploadSuccess}
                  parentId={null}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Search Input */}
        <div className='relative mb-4'>
          <Search className='absolute end-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='جستجو در مستندات...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pe-10 text-end'
          />
        </div>
        
        <p className='text-sm text-gray-600'>
          پوشه‌ها و مستندات را مدیریت کنید
        </p>
      </div>

      <div className='flex-1 overflow-hidden flex flex-col'>
        <div className='flex-1 overflow-y-auto p-4'>
          {filteredItems.length === 0 ? (
            <div className='text-center py-12 text-gray-500'>
              <Folder className='h-16 w-16 mx-auto mb-4 opacity-60' />
              <p className='text-sm font-medium mb-2'>
                {searchQuery ? 'هیچ نتیجه‌ای یافت نشد' : 'هیچ آیتمی یافت نشد'}
              </p>
              <p className='text-xs'>
                {searchQuery 
                  ? 'سعی کنید کلمات کلیدی دیگری جستجو کنید'
                  : 'برای شروع، اولین پوشه یا مستند را ایجاد کنید'
                }
              </p>
            </div>
          ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredItems.filter(item => !item.parentId).map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-2'>
                {filteredItems
                  .filter(item => !item.parentId)
                  .map(item => (
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
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && editingItem && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                ویرایش {editingItem.type === 'FOLDER' ? 'پوشه' : 'مستند'}
              </DialogTitle>
            </DialogHeader>
            <EditWikiItem
              document={editingItem}
              onClose={() => {
                setShowEditDialog(false);
                setEditingItem(null);
              }}
              onSuccess={handleEditSuccess}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              حذف {deletingItem?.type === 'FOLDER' ? 'پوشه' : 'مستند'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید "{deletingItem?.title}" را حذف کنید؟ این عمل قابل بازگشت نیست.
              {deletingItem?.type === 'FOLDER' && (
                <div className='mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm'>
                  ⚠️ اگر این پوشه شامل آیتم‌هایی باشد، ابتدا باید آن‌ها را حذف کنید یا به جای دیگری منتقل کنید.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'در حال حذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

