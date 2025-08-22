"use client";


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Story } from "@/types/story";
import { 
  ShoppingBag, Sun, Heart, Star, Users, Calendar, Gift, 
  TrendingUp, Award, Zap, Coffee, Music, Camera, MapPin, 
  Clock, Target, Lightbulb, FileText, X, Image, ExternalLink, Folder
} from "lucide-react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from "framer-motion";

interface StorySlotProps {
  story?: Story;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onClearSlot?: (_id: string) => void;
  isLoading?: boolean;
}

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
  const StoryTypeIcon = story?.storyType ? getStoryTypeIcon(story.storyType.name) : FileText;

  const {
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClearSlot = (id: string) => {
    // Use the id parameter to validate before calling the parent function
    if (id && id.trim() && onClearSlot) {
      onClearSlot(id);
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
              {/* Top row - Order number and clear button */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    #{story.order}
                  </Badge>
                  {story.storyType && (
                    <Badge variant="outline" className="text-xs">
                      {story.storyType.name}
                    </Badge>
                  )}
                </div>
                
                {onClearSlot && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearSlot(story.id)}
                    className="h-6 w-6 p-0 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border border-red-200"
                    title="حذف استوری"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Story title */}
              <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                {story.title}
              </h3>

              {/* Story type icon */}
              <div className="flex items-center justify-center flex-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <StoryTypeIcon className="h-8 w-8 text-[#ff0a54]" />
                </div>
              </div>

              {/* Bottom section - Notes and metadata */}
              <div className="mt-auto space-y-2">
                {story.notes && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <FileText className="h-3 w-3 text-[#ff0a54]" />
                    <span className="line-clamp-1">{story.notes}</span>
                  </div>
                )}

                {story.visualNotes && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Image className="h-3 w-3 text-[#ff0a54]" />
                    <span>تصویر</span>
                  </div>
                )}

                {story.link && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <ExternalLink className="h-3 w-3 text-[#ff0a54]" />
                    <span>لینک</span>
                  </div>
                )}

                {story.project && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Folder className="h-3 w-3 text-[#ff0a54]" />
                    <span className="line-clamp-1">{story.project.name}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Empty slot - Show template selection prompt
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-3">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">
                اسلات {index + 1}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                برای ایجاد استوری کلیک کنید
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
