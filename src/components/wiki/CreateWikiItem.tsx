'use client';

import { Folder, FileText } from 'lucide-react';
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
import { useCreateWikiItem, useWikiItems, type WikiItem } from '@/stores/wiki.store';
import { useToast } from '@/components/ui/toast';

interface CreateWikiItemProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface WikiFolder {
  id: string;
  title: string;
  type: 'FOLDER';
  parentId: string | null;
}

export function CreateWikiItem({ onClose, onSuccess }: CreateWikiItemProps) {
  const [type, setType] = useState<'FOLDER' | 'DOCUMENT'>('DOCUMENT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  
  const { addToast } = useToast();
  const createMutation = useCreateWikiItem();
  const { data: wikiItems = [] } = useWikiItems();

  // Extract only folders from the tree structure
  const folders = React.useMemo(() => {
    const extractFolders = (items: WikiItem[]): WikiFolder[] => {
      const result: WikiFolder[] = [];
      for (const item of items) {
        if (item.type === 'FOLDER') {
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
  }, [wikiItems]);

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

    // CRITICAL: Log what we're sending to the API
    const mutationData = {
      title: title.trim(),
      content: type === 'DOCUMENT' ? content : undefined,
      type,
      parentId,
    };
    
    console.log('[FRONTEND WIKI CREATE DEBUG] Sending data:', mutationData);
    
    createMutation.mutate(
      mutationData,
      {
        onSuccess: (data) => {
          console.log('[FRONTEND WIKI CREATE SUCCESS] Response:', data);
          // Reset form
          setTitle('');
          setContent('');
          setParentId(null);
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error) => {
          // CRITICAL: Log the full error details
          console.error('[FRONTEND WIKI CREATE ERROR] Full error details:', {
            error: error,
            message: error.message,
            cause: error.cause,
            stack: error.stack,
            name: error.name,
          });
          
          addToast({
            title: 'خطا',
            description: error.message || 'خطا در ایجاد آیتم',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='type'>نوع آیتم</Label>
        <Select
          value={type}
          onValueChange={(value: 'FOLDER' | 'DOCUMENT') => setType(value)}
        >
          <SelectTrigger className="w-full justify-end text-right">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='FOLDER'>
              <div className='flex items-center gap-2'>
                <Folder className='h-4 w-4' />
                پوشه
              </div>
            </SelectItem>
            <SelectItem value='DOCUMENT'>
              <div className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                مستند
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='title'>عنوان</Label>
        <Input
          id='title'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={type === 'FOLDER' ? 'نام پوشه' : 'عنوان مستند'}
          required
        />
      </div>

      {type === 'DOCUMENT' && (
        <div className='space-y-2'>
          <Label htmlFor='content'>محتوای مستند</Label>
          <Textarea
            id='content'
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder='محتوای مستند را اینجا بنویسید...'
            rows={6}
          />
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
            {folders.map(folder => (
              <SelectItem key={folder.id} value={folder.id}>
                <div className='flex items-center gap-2'>
                  <Folder className='h-4 w-4' />
                  {folder.title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex justify-end rtl:justify-start gap-2 pt-4'>
        <Button type='button' variant='outline' onClick={onClose}>
          انصراف
        </Button>
        <Button type='submit' disabled={createMutation.isPending || !title.trim()}>
          {createMutation.isPending ? 'در حال ایجاد...' : 'ایجاد'}
        </Button>
      </div>
    </form>
  );
}

