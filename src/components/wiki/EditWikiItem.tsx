'use client';

import { Folder, Save, X, Eye, Edit3 } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUpdateWikiItem, useWikiItems, type WikiItem } from '@/stores/wiki.store';
import { useToast } from '@/components/ui/toast';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MarkdownGuide } from './MarkdownGuide';

interface WikiFolder {
  id: string;
  title: string;
  type: 'FOLDER';
  parentId: string | null;
}

interface EditWikiItemProps {
  document: WikiItem;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditWikiItem({ document, onClose, onSuccess }: EditWikiItemProps) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content || '');
  const [parentId, setParentId] = useState<string | null>(document.parentId);
  
  const { addToast } = useToast();
  const updateMutation = useUpdateWikiItem();
  const { data: wikiItems = [], isLoading: foldersLoading } = useWikiItems();

  // Extract only folders from the tree structure
  const folders = React.useMemo(() => {
    const extractFolders = (items: WikiItem[]): WikiFolder[] => {
      const result: WikiFolder[] = [];
      for (const item of items) {
        if (item.type === 'FOLDER' && item.id !== document.id) {
          result.push({
            id: item.id,
            title: item.title,
            type: 'FOLDER',
            parentId: item.parentId,
          });
          if (item.children) {
            result.push(...extractFolders(item.children));
          }
        }
      }
      return result;
    };
    return extractFolders(wikiItems);
  }, [wikiItems, document.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast({
        title: 'خطا',
        description: 'لطفاً عنوان را وارد کنید',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate(
      {
        id: document.id,
        data: {
          title: title.trim(),
          content: document.type === 'DOCUMENT' ? content : undefined,
          type: document.type,
          parentId,
        },
      },
      {
        onSuccess: () => {
          addToast({
            title: 'موفقیت',
            description: 'آیتم با موفقیت به‌روزرسانی شد',
            variant: 'success',
          });
          onSuccess();
          onClose();
        },
        onError: (error) => {
          addToast({
            title: 'خطا',
            description: error.message || 'خطا در به‌روزرسانی آیتم',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='title'>عنوان</Label>
        <Input
          id='title'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={document.type === 'FOLDER' ? 'نام پوشه' : 'عنوان مستند'}
          required
        />
      </div>

      {document.type === 'DOCUMENT' && (
        <div className='space-y-2'>
          <div className="flex items-center justify-between">
            <Label htmlFor='content'>محتوای مستند (Markdown)</Label>
            <MarkdownGuide />
          </div>
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                ویرایش
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                پیش‌نمایش
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-2">
              <Textarea
                id='content'
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder='محتوای مستند را اینجا بنویسید... (از Markdown استفاده کنید)'
                rows={12}
                className="font-mono text-sm"
              />
              <div className="mt-2 text-xs text-gray-500">
                💡 از Markdown استفاده کنید: **متن پررنگ**, *متن کج*, `کد`, # عنوان
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
              <div className="border rounded-lg p-4 min-h-[200px] bg-white">
                <MarkdownRenderer content={content} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <div className='space-y-2'>
        <Label htmlFor='parent'>پوشه والد (اختیاری)</Label>
        <Select
          value={parentId || 'none'}
          onValueChange={value => setParentId(value === 'none' ? null : value)}
        >
          <SelectTrigger className="w-full justify-end text-right">
            <SelectValue placeholder='بدون پوشه والد' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='none'>بدون پوشه والد</SelectItem>
            {foldersLoading ? (
              <SelectItem value='loading' disabled>
                در حال بارگذاری...
              </SelectItem>
            ) : (
              folders.map(folder => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className='flex items-center gap-2'>
                    <Folder className='h-4 w-4' />
                    {folder.title}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className='flex justify-end rtl:justify-start gap-2 pt-4'>
        <Button type='button' variant='outline' onClick={onClose}>
          <X className='h-4 w-4 me-2' />
          انصراف
        </Button>
        <Button type='submit' disabled={updateMutation.isPending || !title.trim()}>
          <Save className='h-4 w-4 me-2' />
          {updateMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
      </div>
    </form>
  );
}
