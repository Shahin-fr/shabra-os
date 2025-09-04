'use client';

import { motion } from 'framer-motion';
import {
  Sunrise,
  Package,
  MessageCircle,
  BookOpen,
  Camera,
  Tag,
  Smile,
  Newspaper,
} from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StoryType {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

interface StoryTypePaletteProps {
  storyTypes: StoryType[];
  selectedSlotIndex: number | null;
  onTypeSelect: (storyType: StoryType) => void;
  isLoading?: boolean;
}

const iconMap = {
  Sunrise,
  Package,
  MessageCircle,
  BookOpen,
  Camera,
  Tag,
  Smile,
  Newspaper,
};

export function StoryTypePalette({
  storyTypes,
  selectedSlotIndex,
  onTypeSelect,
  isLoading = false,
}: StoryTypePaletteProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const handleTypeClick = (storyType: StoryType) => {
    if (selectedSlotIndex === null || isLoading) return;
    onTypeSelect(storyType);
  };

  if (isLoading) {
    return (
      <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
        <div className='flex items-center justify-center h-32'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff0a54]'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center'>
          <Package className='h-4 w-4 text-[#ff0a54]' />
        </div>
        <div>
          <h3 className='text-lg font-bold text-gray-900'>پالت انواع استوری</h3>
          <p className='text-sm text-gray-600'>
            {selectedSlotIndex !== null
              ? `اسلات ${selectedSlotIndex + 1} انتخاب شده - نوع استوری را انتخاب کنید`
              : 'ابتدا یک اسلات خالی را انتخاب کنید'}
          </p>
        </div>
      </div>

      {/* Story Types Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3'>
        {storyTypes
          .filter(type => type.isActive)
          .map(storyType => {
            const IconComponent =
              iconMap[storyType.icon as keyof typeof iconMap] || Package;
            const isSelected = selectedSlotIndex !== null;
            const isHovered = hoveredType === storyType.id;

            return (
              <motion.div
                key={storyType.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredType(storyType.id)}
                onHoverEnd={() => setHoveredType(null)}
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-all duration-300 border-2',
                    isSelected
                      ? 'border-[#ff0a54] bg-[#ff0a54]/5 shadow-md'
                      : 'border-gray-200 hover:border-[#ff0a54]/50 hover:shadow-md',
                    !isSelected && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => handleTypeClick(storyType)}
                >
                  <CardContent className='p-4 text-center'>
                    <div className='flex flex-col items-center gap-3'>
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                          isSelected || isHovered
                            ? 'bg-[#ff0a54]/20'
                            : 'bg-gray-100'
                        )}
                      >
                        <IconComponent
                          className={cn(
                            'h-6 w-6 transition-colors',
                            isSelected || isHovered
                              ? 'text-[#ff0a54]'
                              : 'text-gray-600'
                          )}
                        />
                      </div>
                      <div className='space-y-1'>
                        <h4
                          className={cn(
                            'text-sm font-semibold transition-colors',
                            isSelected || isHovered
                              ? 'text-[#ff0a54]'
                              : 'text-gray-900'
                          )}
                        >
                          {storyType.name}
                        </h4>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className='text-xs text-gray-600'
                          >
                            کلیک برای انتخاب
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Instructions */}
      {selectedSlotIndex === null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'
        >
          <div className='flex items-center gap-2'>
            <div className='w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center'>
              <span className='text-blue-600 text-xs'>💡</span>
            </div>
            <p className='text-sm text-blue-800'>
              برای برنامه‌ریزی سریع روز، ابتدا یک اسلات خالی را انتخاب کنید، سپس
              نوع استوری را انتخاب کنید
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
