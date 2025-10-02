'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, Edit, Folder, FileText, MoreVertical, Trash2 } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type WikiItem } from '@/stores/wiki.store';

interface SortableWikiItemProps {
  item: WikiItem;
  level: number;
  onSelect: (id: string) => void;
  selectedDocument: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  onEdit: (item: WikiItem) => void;
  onDelete: (item: WikiItem) => void;
  currentUserId: string | null;
}

export function SortableWikiItem({ 
  item, 
  level = 0, 
  onSelect, 
  selectedDocument, 
  expandedFolders, 
  onToggleFolder,
  onEdit,
  onDelete,
  currentUserId
}: SortableWikiItemProps) {
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

  const isSelected = selectedDocument === item.id;
  const isExpanded = expandedFolders.has(item.id);
  const canEdit = currentUserId && item.authorId === currentUserId;

  const handleClick = () => {
    if (item.type === 'FOLDER') {
      onToggleFolder(item.id);
    } else {
      onSelect(item.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''} ${level > 0 ? 'mr-4' : ''}`}
    >
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
        } ${isDragging ? 'shadow-lg' : ''}`}
        onClick={handleClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Drag handle */}
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
              >
                <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
              </div>

              {/* Folder/File icon */}
              {item.type === 'FOLDER' ? (
                <div className="flex items-center gap-1">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <Folder className="h-4 w-4 text-blue-500" />
                </div>
              ) : (
                <FileText className="h-4 w-4 text-gray-500" />
              )}

              {/* Title */}
              <span className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </span>

              {/* Type badge */}
              <Badge variant="secondary" className="text-xs">
                {item.type === 'FOLDER' ? 'پوشه' : 'سند'}
              </Badge>
            </div>

            {/* Actions */}
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    ویرایش
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Children */}
      {item.type === 'FOLDER' && isExpanded && item.children && (
        <div className="mt-2 space-y-2">
          {item.children.map((child) => (
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
