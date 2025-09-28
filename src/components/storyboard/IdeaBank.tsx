'use client';

import { AnimatePresence } from 'framer-motion';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { X, Search, Filter, Lightbulb, ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DynamicLucideIcon } from '@/components/ui/DynamicLucideIcon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface StoryIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon?: string;
  isActive: boolean;
}

interface IdeaBankProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectIdea: (idea: StoryIdea) => void;
  storyIdeas: StoryIdea[];
  isLoading?: boolean;
  selectedStoryType?: string; // Pre-filter by story type
}

const categoryColors = {
  تعامل: 'bg-blue-100 text-blue-800 border-blue-200',
  فروش: 'bg-green-100 text-green-800 border-green-200',
  'ساخت برند': 'bg-purple-100 text-purple-800 border-purple-200',
  آموزش: 'bg-orange-100 text-orange-800 border-orange-200',
  سرگرمی: 'bg-pink-100 text-pink-800 border-pink-200',
  'پشت صحنه': 'bg-gray-100 text-gray-800 border-gray-200',
  محصول: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  رویداد: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export function IdeaBank({
  isOpen,
  onOpenChange,
  onSelectIdea,
  storyIdeas,
  isLoading = false,
  selectedStoryType,
}: IdeaBankProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<StoryIdea | null>(null);

  // Filter ideas based on search, category, and story type
  const filteredIdeas = useMemo(() => {
    return storyIdeas.filter(idea => {
      const matchesSearch =
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || idea.category === selectedCategory;

      const matchesStoryType =
        !selectedStoryType || idea.storyType === selectedStoryType;

      return (
        matchesSearch && matchesCategory && matchesStoryType && idea.isActive
      );
    });
  }, [storyIdeas, searchQuery, selectedCategory, selectedStoryType]);

  // Get unique categories from filtered ideas
  const categories = useMemo(() => {
    return [...new Set(filteredIdeas.map(idea => idea.category))].sort();
  }, [filteredIdeas]);

  const handleIdeaSelect = (idea: StoryIdea) => {
    setSelectedIdea(idea);
  };

  const handleConfirmSelection = () => {
    if (selectedIdea) {
      onSelectIdea(selectedIdea);
      onOpenChange(false);
      setSelectedIdea(null);
      setSearchQuery('');
      setSelectedCategory(null);
    }
  };

  const handleBackToList = () => {
    setSelectedIdea(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedIdea(null);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className='sm:max-w-4xl max-h-[90vh] border-0 p-0 overflow-hidden bg-white'
        style={{
          boxShadow: `
            0 25px 80px rgba(0, 0, 0, 0.15),
            0 15px 40px rgba(0, 0, 0, 0.1)
          `,
        }}
        hideCloseButton
      >
        <OptimizedMotion
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className='h-full flex flex-col'
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-100'>
            <div className='flex items-center gap-3'>
              {selectedIdea && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleBackToList}
                  className='p-2 hover:bg-gray-100'
                >
                  <ArrowLeft className="rtl:rotate-180 h-4 w-4" />
                </Button>
              )}
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center'>
                  <Lightbulb className='h-4 w-4 text-[#ff0a54]' />
                </div>
                <DialogTitle className='text-xl font-bold text-gray-900'>
                  {selectedIdea ? 'جزئیات ایده' : 'بانک ایده‌ها'}
                </DialogTitle>
              </div>
              {selectedStoryType && (
                <Badge className='bg-[#ff0a54]/10 text-[#ff0a54] border-[#ff0a54]/20'>
                  {selectedStoryType}
                </Badge>
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClose}
              className='p-2 hover:bg-gray-100'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-hidden flex flex-col'>
            <AnimatePresence mode='wait'>
              {!selectedIdea ? (
                <OptimizedMotion
                  key='list'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className='flex-1 flex flex-col overflow-hidden'
                >
                  {/* Search and Filters */}
                  <div className='p-6 border-b border-gray-100 space-y-4'>
                    {/* Search */}
                    <div className='relative'>
                      <Search className='absolute end-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        placeholder='جستجو در ایده‌های استوری...'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className='pe-10 bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50'
                      />
                    </div>

                    {/* Category Filters */}
                    <div className='flex items-center gap-2 flex-wrap'>
                      <Filter className='h-4 w-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>دسته‌بندی:</span>
                      <Button
                        variant={
                          selectedCategory === null ? 'default' : 'outline'
                        }
                        size='sm'
                        onClick={() => setSelectedCategory(null)}
                        className={
                          selectedCategory === null
                            ? 'bg-[#ff0a54] text-white'
                            : ''
                        }
                      >
                        همه
                      </Button>
                      {categories.map(category => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() => setSelectedCategory(category)}
                          className={cn(
                            selectedCategory === category
                              ? 'bg-[#ff0a54] text-white'
                              : '',
                            'text-xs'
                          )}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Ideas Grid */}
                  <div
                    className='flex-1 overflow-y-auto p-6'
                    style={{ maxHeight: 'calc(90vh - 200px)' }}
                  >
                    <div className='min-h-full'>
                      {isLoading ? (
                        <div className='flex items-center justify-center h-64'>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff0a54]'></div>
                        </div>
                      ) : filteredIdeas.length === 0 ? (
                        <div className='text-center py-12'>
                          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <Search className='h-8 w-8 text-gray-400' />
                          </div>
                          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                            هیچ ایده‌ای یافت نشد
                          </h3>
                          <p className='text-gray-600'>
                            {selectedStoryType
                              ? `هیچ ایده‌ای برای "${selectedStoryType}" یافت نشد`
                              : 'سعی کنید کلمات کلیدی دیگری جستجو کنید'}
                          </p>
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4'>
                          {filteredIdeas.map(idea => (
                            <OptimizedMotion
                              key={idea.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <Card
                                className='cursor-pointer transition-all duration-300 hover:shadow-lg border-gray-200 hover:border-[#ff0a54]/30'
                                onClick={() => handleIdeaSelect(idea)}
                              >
                                <CardContent className='p-4'>
                                  <div className='flex items-start rtl:items-start gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center flex-shrink-0'>
                                      <DynamicLucideIcon
                                        iconName={idea.icon}
                                        className='h-5 w-5 text-[#ff0a54]'
                                        fallbackIcon={Lightbulb}
                                      />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                      <div className='flex items-center gap-2 mb-2'>
                                        <h3 className='font-semibold text-gray-900 text-sm truncate'>
                                          {idea.title}
                                        </h3>
                                        <Badge
                                          className={cn(
                                            'text-xs px-2 py-1',
                                            categoryColors[
                                              idea.category as keyof typeof categoryColors
                                            ] || 'bg-gray-100 text-gray-800'
                                          )}
                                        >
                                          {idea.category}
                                        </Badge>
                                      </div>
                                      <p className='text-xs text-gray-600 line-clamp-2'>
                                        {idea.description}
                                      </p>
                                      <div className='mt-2 text-xs text-[#ff0a54] font-medium'>
                                        کلیک برای انتخاب
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </OptimizedMotion>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </OptimizedMotion>
              ) : (
                <OptimizedMotion
                  key='detail'
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className='h-full flex flex-col'
                >
                  {/* Idea Detail */}
                  <div className='flex-1 overflow-y-auto p-6'>
                    <div className='max-w-2xl mx-auto space-y-6'>
                      {/* Header */}
                      <div className='text-center'>
                        <div className='w-16 h-16 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center mx-auto mb-4'>
                          <DynamicLucideIcon
                            iconName={selectedIdea.icon}
                            className='h-8 w-8 text-[#ff0a54]'
                            fallbackIcon={Lightbulb}
                          />
                        </div>
                        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                          {selectedIdea.title}
                        </h2>
                        <div className='flex items-center justify-center gap-2'>
                          <Badge
                            className={cn(
                              'text-sm px-3 py-1',
                              categoryColors[
                                selectedIdea.category as keyof typeof categoryColors
                              ] || 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {selectedIdea.category}
                          </Badge>
                          <Badge className='bg-[#ff0a54]/10 text-[#ff0a54] border-[#ff0a54]/20'>
                            {selectedIdea.storyType}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                          توضیحات
                        </h3>
                        <p className='text-gray-700 leading-relaxed'>
                          {selectedIdea.description}
                        </p>
                      </div>

                      {/* Template */}
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                          قالب پیشنهادی
                        </h3>
                        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                          <code className='text-sm text-gray-800 font-mono'>
                            {selectedIdea.template}
                          </code>
                        </div>
                      </div>

                      {/* Guidelines */}
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                          راهنمای استفاده
                        </h3>
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                          <pre className='text-sm text-gray-800 whitespace-pre-wrap font-sans'>
                            {selectedIdea.guidelines}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='p-6 border-t border-gray-100'>
                    <div className='flex items-center justify-between gap-3'>
                      <Button
                        variant='outline'
                        onClick={handleBackToList}
                        className='flex-1'
                      >
                        بازگشت به لیست
                      </Button>
                      <Button
                        onClick={handleConfirmSelection}
                        className='flex-1 bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
                      >
                        انتخاب این ایده
                      </Button>
                    </div>
                  </div>
                </OptimizedMotion>
              )}
            </AnimatePresence>
          </div>
        </OptimizedMotion>
      </DialogContent>
    </Dialog>
  );
}

