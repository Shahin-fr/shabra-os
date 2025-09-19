'use client';

import { useState, useEffect } from 'react';
import { Trash2, Loader2, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useInstapulsePages } from '@/hooks/use-instapulse-pages';

// Type definition for TrackedInstagramPage
interface TrackedInstagramPage {
  id: number;
  username: string;
  profileUrl: string;
  followerCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PageManager() {
  const [newUsername, setNewUsername] = useState('');
  const [editingPage, setEditingPage] = useState<TrackedInstagramPage | null>(
    null
  );
  const [newFollowerCount, setNewFollowerCount] = useState<number>(0);
  const [hasInitiatedUpdate, setHasInitiatedUpdate] = useState(false);

  const {
    pages,
    isLoading,
    isError,
    error,
    addPage,
    deletePage,
    updatePage,
    isAddingPage,
    isDeletingPage,
    isUpdatingPage,
    addPageError,
    deletePageError,
    updatePageError,
  } = useInstapulsePages();

  const handleAddPage = () => {
    if (!newUsername.trim() || isAddingPage) return;

    addPage(newUsername.trim());
    setNewUsername('');
  };

  const handleDeletePage = (id: number) => {
    if (isDeletingPage) return;
    deletePage(id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPage();
    }
  };

  const handleEditPage = (page: TrackedInstagramPage) => {
    setEditingPage(page);
    setNewFollowerCount(page.followerCount);
    setHasInitiatedUpdate(false); // Reset update flag when starting edit
  };

  const handleCancelEdit = () => {
    setEditingPage(null);
    setNewFollowerCount(0);
    setHasInitiatedUpdate(false);
  };

  const handleSaveChanges = () => {
    if (!editingPage || isUpdatingPage) return;

    setHasInitiatedUpdate(true);
    updatePage({
      id: editingPage.id,
      followerCount: newFollowerCount,
    });
  };


  // Handle successful update - exit edit mode
  useEffect(() => {
    // Only exit edit mode if we initiated an update AND it's now complete AND there's no error
    if (
      hasInitiatedUpdate &&
      !isUpdatingPage &&
      !updatePageError &&
      editingPage
    ) {
      setEditingPage(null);
      setNewFollowerCount(0);
      setHasInitiatedUpdate(false);
    }
  }, [hasInitiatedUpdate, isUpdatingPage, updatePageError, editingPage]);

  // Show loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>در حال بارگذاری پیج‌ها...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className='space-y-4'>
        <div className='text-center py-8'>
          <p className='text-destructive text-sm'>
            خطا در بارگذاری پیج‌ها: {error?.message || 'خطای نامشخص'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {editingPage ? (
        /* Edit Mode */
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            ویرایش @{editingPage.username}
          </h3>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                تعداد دنبال‌کنندگان
              </label>
              <Input
                type='number'
                value={newFollowerCount}
                onChange={e =>
                  setNewFollowerCount(parseInt(e.target.value) || 0)
                }
                className='w-full'
                min='0'
                step='1'
              />
            </div>

            <div className='flex gap-2 pt-4'>
              <Button
                onClick={handleSaveChanges}
                disabled={isUpdatingPage}
                className='flex-1'
              >
                {isUpdatingPage ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    در حال ذخیره...
                  </>
                ) : (
                  'ذخیره تغییرات'
                )}
              </Button>
              <Button
                variant='outline'
                onClick={handleCancelEdit}
                disabled={isUpdatingPage}
                className='flex-1'
              >
                لغو
              </Button>
            </div>

            {/* Update Page Error */}
            {updatePageError && (
              <p className='text-destructive text-sm'>
                خطا در به‌روزرسانی پیج: {updatePageError.message}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Normal Mode - Add Page and Pages List */
        <>
          {/* Add New Page Section */}
          <div className='space-y-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='نام کاربری پیج جدید را وارد کنید...'
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className='flex-1'
                disabled={isAddingPage}
              />
              <Button
                onClick={handleAddPage}
                disabled={!newUsername.trim() || isAddingPage}
              >
                {isAddingPage ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    در حال افزودن...
                  </>
                ) : (
                  'افزودن'
                )}
              </Button>
            </div>

            {/* Add Page Error */}
            {addPageError && (
              <p className='text-destructive text-sm'>
                خطا در افزودن پیج: {addPageError.message}
              </p>
            )}
          </div>

          {/* Separator */}
          <Separator />

          {/* Existing Pages List Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-foreground'>
              پیج‌های دنبال شده
            </h3>

            {pages.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                هنوز هیچ پیجی دنبال نمی‌شود. برای شروع یکی اضافه کنید.
              </p>
            ) : (
              <div className='space-y-2'>
                {pages.map(page => (
                  <div
                    key={page.id}
                    className='flex items-center justify-between p-3 bg-muted/50 rounded-lg border'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-foreground'>
                          @{page.username}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          ({page.followerCount.toLocaleString()} followers)
                        </span>
                      </div>
                      <div className='text-xs text-muted-foreground mt-1'>
                        {page.profileUrl}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleEditPage(page)}
                        className='h-8 w-8'
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        onClick={() => handleDeletePage(page.id)}
                        disabled={isDeletingPage}
                        className='h-8 w-8'
                      >
                        {isDeletingPage ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Trash2 className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Delete Page Error */}
            {deletePageError && (
              <p className='text-destructive text-sm'>
                خطا در حذف پیج: {deletePageError.message}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

