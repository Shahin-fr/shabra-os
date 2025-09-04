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
import { logger } from '@/lib/logger';

interface CreateWikiItemProps {
  onClose: () => void;
}

export function CreateWikiItem({ onClose }: CreateWikiItemProps) {
  const [type, setType] = useState<'FOLDER' | 'DOCUMENT'>('DOCUMENT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/wiki', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: type === 'DOCUMENT' ? content : null,
          type,
          parentId,
        }),
      });

      if (response.ok) {
        onClose();
        // TODO: Refresh the wiki items list
      }
    } catch (error) {
      logger.error('Error creating wiki item:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='type'>نوع آیتم</Label>
        <Select
          value={type}
          onValueChange={(value: 'FOLDER' | 'DOCUMENT') => setType(value)}
        >
          <SelectTrigger>
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
          value={parentId || ''}
          onValueChange={value => setParentId(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder='بدون پوشه والد' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>بدون پوشه والد</SelectItem>
            {/* TODO: Add parent folder options */}
          </SelectContent>
        </Select>
      </div>

      <div className='flex justify-end gap-2 pt-4'>
        <Button type='button' variant='outline' onClick={onClose}>
          انصراف
        </Button>
        <Button type='submit' disabled={loading || !title.trim()}>
          {loading ? 'در حال ایجاد...' : 'ایجاد'}
        </Button>
      </div>
    </form>
  );
}
