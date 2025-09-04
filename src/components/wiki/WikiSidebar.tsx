'use client';

import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

// Button import removed - no longer needed
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface WikiItem {
  id: string;
  title: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId: string | null;
  children?: WikiItem[];
}

interface WikiSidebarProps {
  onDocumentSelect: (_documentId: string | null) => void;
  selectedDocument: string | null;
}

export function WikiSidebar({
  onDocumentSelect,
  selectedDocument,
}: WikiSidebarProps) {
  const [wikiItems, setWikiItems] = useState<WikiItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWikiItems();
  }, []);

  const fetchWikiItems = async () => {
    try {
      const response = await fetch('/api/wiki');
      if (response.ok) {
        const data = await response.json();
        setWikiItems(data);
      }
    } catch (error) {
      logger.error('Error fetching wiki items:', error as Error);
    } finally {
      setLoading(false);
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

  const renderWikiItem = (item: WikiItem, level: number = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = selectedDocument === item.id;

    return (
      <div key={item.id}>
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-gray-200/80 rounded-lg transition-all duration-200 group',
            isSelected && 'bg-pink-50 text-pink-700 border border-pink-200',
            level > 0 && 'ml-6'
          )}
          onClick={() => {
            if (item.type === 'DOCUMENT') {
              onDocumentSelect(item.id);
            } else if (item.type === 'FOLDER') {
              toggleFolder(item.id);
            }
          }}
        >
          {item.type === 'FOLDER' ? (
            <>
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className='h-4 w-4 flex-shrink-0' />
                ) : (
                  <ChevronRight className='h-4 w-4 flex-shrink-0' />
                )
              ) : (
                <div className='w-4 h-4' />
              )}
              <Folder className='h-4 w-4 text-pink-400 flex-shrink-0' />
            </>
          ) : (
            <FileText className='h-4 w-4 text-gray-600 flex-shrink-0' />
          )}

          <span className='truncate flex-1'>{item.title}</span>

          {/* Plus button removed - content managed via markdown files */}
        </div>

        {item.type === 'FOLDER' && isExpanded && hasChildren && (
          <div>
            {item.children!.map(child => renderWikiItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className='w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
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

  return (
    <div className='w-80 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80 rounded-xl border border-gray-200/50 shadow-sm'>
      <div className='p-6 border-b border-gray-200/50'>
        <h2 className='font-bold text-xl mb-3 text-gray-800'>ساختار شبرالوگ</h2>
        <p className='text-sm text-gray-600'>
          پوشه‌ها و مستندات را مدیریت کنید
        </p>
      </div>

      <div className='p-4'>
        {wikiItems.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>
            <Folder className='h-16 w-16 mx-auto mb-4 opacity-60' />
            <p className='text-sm font-medium mb-2'>هیچ آیتمی یافت نشد</p>
            <p className='text-xs'>
              برای شروع، اولین پوشه یا مستند را ایجاد کنید
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {wikiItems.map(item => renderWikiItem(item))}
          </div>
        )}
      </div>
    </div>
  );
}
