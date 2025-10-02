'use client';

import { FileText, BookOpen, Edit, Trash2, MoreVertical, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ClientOnly from '@/components/ui/ClientOnly';
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
import { formatJalaliDate } from '@/lib/date-utils';
import { useWikiItem, useDeleteWikiItem } from '@/stores/wiki.store';
import { useToast } from '@/components/ui/toast';
import { EditWikiItem } from './EditWikiItem';
import { PDFViewer } from './PDFViewer';
import { MarkdownRenderer } from './MarkdownRenderer';

interface WikiContentProps {
  documentId: string | null;
  onRefresh?: () => void;
}

export function WikiContent({ documentId, onRefresh }: WikiContentProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  
  const { addToast } = useToast();
  const { data: document, isLoading, error } = useWikiItem(documentId);
  const deleteMutation = useDeleteWikiItem();

  useEffect(() => {
    // Get current user ID from session
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

  const handleDelete = async () => {
    if (!document) return;

    deleteMutation.mutate(document.id, {
      onSuccess: () => {
        addToast({
          title: 'موفقیت',
          description: 'آیتم با موفقیت حذف شد',
          variant: 'success',
        });
        setShowDeleteDialog(false);
        if (onRefresh) {
          onRefresh();
        }
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

  const canEdit = document && currentUserId && document?.authorId === currentUserId;
  const isSystemDocument = document?.id?.startsWith('doc-') || false;

  if (!documentId) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-[50vh]'>
        <div className='text-center max-w-lg'>
          <BookOpen className='h-24 w-24 mx-auto mb-8 text-pink-300' />
          <h2 className='text-3xl font-bold mb-4 text-gray-800'>
            به شبرالوگ خوش آمدید
          </h2>
          <p className='text-lg text-gray-600 mb-8 leading-relaxed'>
            برای شروع، یک مستند یا پوشه را از نوار کناری انتخاب کنید
          </p>
          <div className='text-base text-gray-500 space-y-3'>
            <p className='flex items-center justify-center gap-2'>
              <span className='w-2 h-2 bg-pink-300 rounded-full'></span>
              پوشه‌ها برای سازماندهی محتوا
            </p>
            <p className='flex items-center justify-center gap-2'>
              <span className='w-2 h-2 bg-pink-300 rounded-full'></span>
              مستندات برای نگهداری اطلاعات
            </p>
            <p className='flex items-center justify-center gap-2'>
              <span className='w-2 h-2 bg-pink-300 rounded-full'></span>
              جستجو و فیلتر کردن آسان
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-[50vh]'>
        <div className='animate-pulse space-y-6 w-full max-w-5xl px-8'>
          <div className='h-10 bg-gray-200 rounded-xl w-3/4 mx-auto'></div>
          <div className='h-5 bg-gray-200 rounded-lg w-1/2 mx-auto'></div>
          <div className='space-y-4 max-w-3xl mx-auto'>
            <div className='h-4 bg-gray-200 rounded-lg w-full'></div>
            <div className='h-4 bg-gray-200 rounded-lg w-5/6'></div>
            <div className='h-4 bg-gray-200 rounded-lg w-4/6'></div>
            <div className='h-4 bg-gray-200 rounded-lg w-3/4'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-[50vh]'>
        <div className='text-center max-w-lg'>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'خطا در بارگذاری مستند. لطفاً دوباره تلاش کنید.'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => {
              if (onRefresh) {
                onRefresh();
              } else {
                window.location.reload();
              }
            }} 
            variant="outline" 
            className="mt-4"
          >
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-[50vh]'>
        <div className='text-center max-w-md'>
          <FileText className='h-20 w-20 mx-auto mb-6 text-red-400' />
          <h2 className='text-2xl font-bold mb-3 text-gray-800'>
            مستند یافت نشد
          </h2>
          <p className='text-gray-600 leading-relaxed'>
            مستند مورد نظر شما وجود ندارد یا حذف شده است
          </p>
        </div>
      </div>
    );
  }

  if (document?.type === 'FOLDER') {
    return (
      <div className='flex-1 p-8'>
        <div className='max-w-5xl mx-auto'>
          <Card className='mb-8'>
            <CardHeader>
              <div className='flex items-start rtl:items-start justify-between gap-4'>
                <div>
                  <CardTitle className='text-4xl font-bold text-gray-800'>
                    {document?.title}
                  </CardTitle>
                  <p className='text-lg text-gray-600'>
                    پوشه‌ای برای سازماندهی محتوا
                  </p>
                </div>
                {canEdit && !isSystemDocument && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' size='sm' className='flex-shrink-0'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Edit className='h-4 w-4 me-2' />
                        ویرایش
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className='text-red-600 focus:text-red-600'
                      >
                        <Trash2 className='h-4 w-4 me-2' />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
          </Card>

          <div className='bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-12 text-center border border-gray-200/50'>
            <FileText className='h-20 w-20 mx-auto mb-6 text-pink-300' />
            <p className='text-lg text-gray-600 max-w-md mx-auto leading-relaxed mb-6'>
              این یک پوشه است. برای مشاهده محتوا، آیتم‌های داخل آن را از نوار
              کناری انتخاب کنید.
            </p>
            {document.children && document.children.length > 0 && (
              <div className='mt-6'>
                <p className='text-sm text-gray-500 mb-3'>
                  این پوشه شامل {document.children.length} آیتم است:
                </p>
                <div className='flex flex-wrap justify-center gap-2'>
                  {document.children.map((child) => (
                    <div key={child.id} className='relative group'>
                      <Badge
                        variant='secondary'
                        className='bg-blue-50 text-blue-700 border-blue-200 pr-8'
                      >
                        {child.type === 'FOLDER' ? '📁' : '📄'} {child.title}
                      </Badge>
                      {canEdit && !child.id?.startsWith('doc-') && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600'
                          onClick={() => {
                            if (confirm(`آیا مطمئن هستید که می‌خواهید "${child.title}" را حذف کنید؟`)) {
                              deleteMutation.mutate(child.id, {
                                onSuccess: () => {
                                  addToast({
                                    title: 'موفقیت',
                                    description: 'آیتم با موفقیت حذف شد',
                                    variant: 'success',
                                  });
                                  if (onRefresh) {
                                    onRefresh();
                                  }
                                },
                                onError: (error) => {
                                  if (error.message && error.message.includes('Cannot delete folder that contains')) {
                                    addToast({
                                      title: 'نمی‌توان پوشه را حذف کرد',
                                      description: 'ابتدا تمام آیتم‌های داخل این پوشه را حذف کنید.',
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
                            }
                          }}
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className='mt-3 flex flex-col items-center gap-2'>
                  <p className='text-xs text-gray-400'>
                    برای حذف این پوشه، ابتدا تمام آیتم‌های بالا را حذف کنید
                  </p>
                  {canEdit && (
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-red-600 border-red-200 hover:bg-red-50'
                      onClick={() => {
                        if (confirm(`آیا مطمئن هستید که می‌خواهید تمام ${document.children?.length || 0} آیتم داخل این پوشه را حذف کنید؟ این عمل قابل بازگشت نیست.`)) {
                          // Delete all children
                          const deletePromises = document.children?.map(child => 
                            fetch(`/api/wiki/${child.id}`, { method: 'DELETE' })
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error(`Failed to delete ${child.title}`);
                                }
                                return response.json();
                              })
                          );
                          
                          Promise.all(deletePromises || [])
                            .then(() => {
                              addToast({
                                title: 'موفقیت',
                                description: `تمام ${document.children?.length || 0} آیتم با موفقیت حذف شد`,
                                variant: 'success',
                              });
                              if (onRefresh) {
                                onRefresh();
                              }
                            })
                            .catch(() => {
                              addToast({
                                title: 'خطا',
                                description: 'خطا در حذف برخی از آیتم‌ها',
                                variant: 'destructive',
                              });
                            });
                        }
                      }}
                    >
                      <Trash2 className='h-4 w-4 me-2' />
                      حذف همه فرزندان
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-5xl mx-auto'>
        {/* Document Header */}
        <Card className='mb-8'>
          <CardHeader>
            <div className='flex items-start rtl:items-start justify-between gap-4'>
              <CardTitle className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 break-words'>
                {document?.title}
              </CardTitle>
              {canEdit && !isSystemDocument && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='flex-shrink-0'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                      <Edit className='h-4 w-4 me-2' />
                      ویرایش
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className='text-red-600 focus:text-red-600'
                    >
                      <Trash2 className='h-4 w-4 me-2' />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 mb-4'>
              <div className='flex items-center gap-2'>
                <span className='text-gray-500'>نویسنده:</span>
                <span className='font-semibold text-gray-800'>
                  {typeof document?.author === 'string'
                    ? document?.author
                    : `${document?.author?.firstName || ''} ${document?.author?.lastName || ''}`.trim()}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-gray-500'>تاریخ ایجاد:</span>
                <span className='font-medium'>
                  <ClientOnly fallback='...'>
                    {formatJalaliDate(new Date(document?.createdAt), 'yyyy/M/d')}
                  </ClientOnly>
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-gray-500'>آخرین ویرایش:</span>
                <span className='font-medium'>
                  <ClientOnly fallback='...'>
                    {formatJalaliDate(new Date(document?.updatedAt), 'yyyy/M/d')}
                  </ClientOnly>
                </span>
              </div>
            </div>

            {document?.tags && document.tags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {document?.tags?.map(tag => (
                  <Badge
                    key={tag}
                    variant='secondary'
                    className='bg-pink-50 text-pink-700 border-pink-200'
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Document Content */}
        <Card className='overflow-hidden'>
          <CardContent className='p-8'>
            {/* PDF Viewer */}
            {document?.fileType === 'pdf' && document?.fileUrl ? (
              <PDFViewer
                fileUrl={document?.fileUrl}
                fileName={document?.originalName || document?.title}
                fileSize={document?.fileSize}
              />
            ) : (
              /* Markdown/Text Content */
              <MarkdownRenderer content={document?.content || ''} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && document && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>ویرایش {(document?.type as string) === 'FOLDER' ? 'پوشه' : 'مستند'}</h2>
              <EditWikiItem
                document={document}
                onClose={() => setShowEditDialog(false)}
                onSuccess={() => {
                  setShowEditDialog(false);
                  if (onRefresh) {
                    onRefresh();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {(document?.type as string) === 'FOLDER' ? 'پوشه' : 'مستند'}</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید "{document?.title}" را حذف کنید؟ این عمل قابل بازگشت نیست.
              {(document?.type as string) === 'FOLDER' && (
                <div className='mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm'>
                  ⚠️ اگر این پوشه شامل آیتم‌هایی باشد، ابتدا باید آن‌ها را حذف کنید یا به جای دیگری منتقل کنید.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleteMutation.isPending ? 'در حال حذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

