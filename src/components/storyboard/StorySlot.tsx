"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  Image, 
  ShoppingBag, 
  Sun, 
  Heart, 
  Star, 
  Users, 
  Calendar, 
  Gift, 
  TrendingUp, 
  Award,
  Zap,
  Coffee,
  Music,
  Camera,
  MapPin,
  Clock,
  Target,
  Lightbulb,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from "framer-motion";

interface Story {
  id: string;
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: string;
  order: number;
  status: "DRAFT" | "READY" | "PUBLISHED";
  storyType?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

interface StorySlotProps {
  story?: Story;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onClearSlot?: (storyId: string) => void;
  isLoading?: boolean;
}

const statusConfig = {
  DRAFT: { label: "پیش‌نویس", color: "bg-muted text-muted-foreground border border-border" },
  READY: { label: "آماده", color: "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800" },
  PUBLISHED: { label: "منتشر شده", color: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-yellow-800" },
};

// Map story type names to relevant icons
const getStoryTypeIcon = (storyTypeName: string) => {
  const name = storyTypeName.toLowerCase();
  
  if (name.includes('محصول') || name.includes('product')) return ShoppingBag;
  if (name.includes('سلام') || name.includes('صبح') || name.includes('morning')) return Sun;
  if (name.includes('عشق') || name.includes('love') || name.includes('heart')) return Heart;
  if (name.includes('ستاره') || name.includes('star') || name.includes('featured')) return Star;
  if (name.includes('کاربر') || name.includes('user') || name.includes('community')) return Users;
  if (name.includes('رویداد') || name.includes('event') || name.includes('calendar')) return Calendar;
  if (name.includes('هدیه') || name.includes('gift') || name.includes('offer')) return Gift;
  if (name.includes('روند') || name.includes('trend') || name.includes('popular')) return TrendingUp;
  if (name.includes('جایزه') || name.includes('award') || name.includes('achievement')) return Award;
  if (name.includes('انرژی') || name.includes('energy') || name.includes('power')) return Zap;
  if (name.includes('قهوه') || name.includes('coffee') || name.includes('break')) return Coffee;
  if (name.includes('موسیقی') || name.includes('music') || name.includes('song')) return Music;
  if (name.includes('عکس') || name.includes('photo') || name.includes('image')) return Camera;
  if (name.includes('مکان') || name.includes('location') || name.includes('place')) return MapPin;
  if (name.includes('زمان') || name.includes('time') || name.includes('schedule')) return Clock;
  if (name.includes('هدف') || name.includes('goal') || name.includes('target')) return Target;
  if (name.includes('ایده') || name.includes('idea') || name.includes('creative')) return Lightbulb;
  
  // Default icon
  return FileText;
};

export function StorySlot({ story, index, isSelected, onClick, onClearSlot, isLoading = false }: StorySlotProps) {
  const status = story ? statusConfig[story.status] : null;
  const StoryTypeIcon = story?.storyType ? getStoryTypeIcon(story.storyType.name) : FileText;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClearSlot = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (story && onClearSlot) {
      onClearSlot(story.id);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card
        ref={setNodeRef}
        {...attributes}
        className={cn(
          "relative cursor-pointer transition-all duration-300",
          "aspect-[9/16] min-h-[300px] max-h-[450px]",
          "border-2 border-dashed border-gray-400 hover:border-[#ff0a54]/70",
          "bg-gray-50 hover:bg-gray-100",
          "shadow-lg hover:shadow-xl",
          isSelected && "border-[#ff0a54] border-solid shadow-xl ring-2 ring-[#ff0a54]/30 bg-white",
          isLoading && isSelected && "animate-pulse",
          isDragging && "opacity-50 scale-105 z-50"
        )}
        style={{
          ...style,
          background: isSelected 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'rgba(248, 250, 252, 0.9)',
          border: isSelected 
            ? '2px solid rgba(255, 10, 84, 0.8)' 
            : '2px dashed rgba(156, 163, 175, 0.7)',
          boxShadow: isSelected 
            ? `
              0 12px 40px rgba(0, 0, 0, 0.15),
              0 6px 20px rgba(255, 10, 84, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `
            : `
              0 8px 25px rgba(0, 0, 0, 0.1),
              0 4px 15px rgba(0, 0, 0, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.6)
            `
        }}
        onClick={onClick}
      >
        <CardContent className="p-6 h-full flex flex-col">
          {story ? (
            // Story content - Refined layout
            <div className="flex flex-col h-full">
              {/* Top row - Status badge in corner and Order number */}
              <div className="flex items-start justify-between mb-3">
                {status && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge className={cn("text-xs font-medium px-2 py-1", status.color)}>
                      {status.label}
                    </Badge>
                  </motion.div>
                )}
                <div className="flex items-center gap-2">
                  {/* Clear slot button */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSlot}
                      className="h-6 w-6 p-0 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border border-red-200"
                      title="حذف استوری"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </motion.div>
                  <motion.div 
                    {...listeners}
                    className="w-8 h-8 bg-[#ff0a54]/30 rounded-full flex items-center justify-center text-sm font-medium text-[#ff0a54] cursor-grab active:cursor-grabbing"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {index + 1}
                  </motion.div>
                </div>
              </div>

              {/* Main content - Large centered icon */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div 
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mb-6",
                    "bg-gradient-to-br from-[#ff0a54]/40 to-[#ff0a54]/60",
                    "border-2 border-[#ff0a54]/50"
                  )}
                  style={{
                    boxShadow: `
                      0 8px 25px rgba(255, 10, 84, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6)
                    `
                  }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <StoryTypeIcon className="h-10 w-10 text-white" />
                </motion.div>
                
                {/* Story type name - Most prominent text */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-2">
                  {story.storyType?.name || story.title}
                </h3>
                
                {/* Story title (if different from type name) - Smaller and muted */}
                {story.storyType && story.title !== story.storyType.name && (
                  <p className="text-sm text-gray-700 leading-tight line-clamp-2">
                    {story.title}
                  </p>
                )}
              </div>

              {/* Bottom indicators - Smaller and less prominent */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                {story.visualNotes && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Image className="h-3 w-3 text-[#ff0a54]" />
                    <span>تصویر</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Empty slot - Refined layout
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              {/* Order number */}
              <div className="absolute top-3 right-3">
                <motion.div 
                  {...listeners}
                  className="w-8 h-8 bg-[#ff0a54]/30 rounded-full flex items-center justify-center text-sm font-medium text-[#ff0a54] cursor-grab active:cursor-grabbing"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {index + 1}
                </motion.div>
              </div>
              
              {/* Main content */}
              <div className="flex flex-col items-center">
                <motion.div 
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mb-6",
                    "bg-gradient-to-br from-[#ff0a54]/30 to-[#ff0a54]/40",
                    "border-2 border-dashed border-[#ff0a54]/50"
                  )}
                  style={{
                    boxShadow: `
                      0 6px 20px rgba(255, 10, 84, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `
                  }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <Plus className="h-10 w-10 text-[#ff0a54]" />
                </motion.div>
                <p className="text-base text-center font-medium text-gray-800 mb-2">اسلات خالی</p>
                <p className="text-sm text-center text-gray-600">کلیک برای انتخاب</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
