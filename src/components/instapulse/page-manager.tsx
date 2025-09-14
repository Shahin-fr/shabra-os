'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useInstapulsePages } from '@/hooks/use-instapulse-pages';

export default function PageManager() {
  const [newUsername, setNewUsername] = useState('');
  
  const {
    pages,
    isLoading,
    isError,
    error,
    addPage,
    deletePage,
    isAddingPage,
    isDeletingPage,
    addPageError,
    deletePageError,
  } = useInstapulsePages();

  const handleAddPage = () => {
    if (!newUsername.trim() || isAddingPage) return;

    console.log('Sending this username to API:', newUsername);
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>در حال بارگذاری پیج‌ها...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-destructive text-sm">
            خطا در بارگذاری پیج‌ها: {error?.message || 'خطای نامشخص'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Page Section */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="نام کاربری پیج جدید را وارد کنید..."
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isAddingPage}
          />
          <Button 
            onClick={handleAddPage} 
            disabled={!newUsername.trim() || isAddingPage}
          >
            {isAddingPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                در حال افزودن...
              </>
            ) : (
              'افزودن'
            )}
          </Button>
        </div>
        
        {/* Add Page Error */}
        {addPageError && (
          <p className="text-destructive text-sm">
            خطا در افزودن پیج: {addPageError.message}
          </p>
        )}
      </div>

      {/* Separator */}
      <Separator />

      {/* Existing Pages List Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          پیج‌های دنبال شده
        </h3>
        
        {pages.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            هنوز هیچ پیجی دنبال نمی‌شود. برای شروع یکی اضافه کنید.
          </p>
        ) : (
          <div className="space-y-2">
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      @{page.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({page.followerCount.toLocaleString()} followers)
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {page.profileUrl}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeletePage(page.id)}
                  disabled={isDeletingPage}
                  className="h-8 w-8"
                >
                  {isDeletingPage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Delete Page Error */}
        {deletePageError && (
          <p className="text-destructive text-sm">
            خطا در حذف پیج: {deletePageError.message}
          </p>
        )}
      </div>
    </div>
  );
}
