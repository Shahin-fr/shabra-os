'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Lightbulb,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DynamicLucideIcon } from '@/components/ui/DynamicLucideIcon';
import { IconPicker } from '@/components/ui/icon-picker';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { showStatusMessage } from '@/lib/utils';

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
  createdAt: string;
  updatedAt: string;
}

interface StoryType {
  id: string;
  name: string;
  icon?: string;
}

interface StoryIdeaFormData {
  title: string;
  description: string;
  category: string;
  storyType: string;
  template: string;
  guidelines: string;
  icon: string;
}

const categories = [
  'تعامل',
  'محصول',
  'آموزش',
  'پشت صحنه',
  'فروش',
  'سرگرمی',
  'اخبار',
];

export function StoryIdeaManager() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<StoryIdea | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [storyTypeFilter, setStoryTypeFilter] = useState('all');
  const [formData, setFormData] = useState<StoryIdeaFormData>({
    title: '',
    description: '',
    category: '',
    storyType: '',
    template: '',
    guidelines: '',
    icon: 'Lightbulb',
  });

  const queryClient = useQueryClient();

  // Fetch story types
  const { data: storyTypes = [] } = useQuery<StoryType[]>({
    queryKey: ['story-types'],
    queryFn: async () => {
      const response = await fetch('/api/story-types');
      if (!response.ok) throw new Error('Failed to fetch story types');
      return response.json();
    },
  });

  // Fetch story ideas
  const { data: storyIdeas = [], isLoading } = useQuery<StoryIdea[]>({
    queryKey: [
      'story-ideas-admin',
      searchQuery,
      categoryFilter,
      storyTypeFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (storyTypeFilter !== 'all')
        params.append('storyType', storyTypeFilter);
      params.append('includeInactive', 'true');

      const response = await fetch(`/api/story-ideas?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch story ideas');
      return response.json();
    },
  });

  // Create story idea mutation
  const createMutation = useMutation({
    mutationFn: async (data: StoryIdeaFormData) => {
      const response = await fetch('/api/story-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create story idea');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-ideas-admin'] });
      queryClient.invalidateQueries({ queryKey: ['story-ideas'] });
      queryClient.invalidateQueries({
        queryKey: [
          'story-ideas-admin',
          searchQuery,
          categoryFilter,
          storyTypeFilter,
        ],
      });
      setIsCreateModalOpen(false);
      resetForm();
      showStatusMessage('ایده استوری با موفقیت ایجاد شد!', 3000);
    },
    onError: (error: Error) => {
      showStatusMessage(`خطا در ایجاد ایده استوری: ${error.message}`, 4000);
    },
  });

  // Update story idea mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<StoryIdeaFormData>;
    }) => {
      const response = await fetch(`/api/story-ideas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update story idea');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-ideas-admin'] });
      queryClient.invalidateQueries({ queryKey: ['story-ideas'] });
      setEditingIdea(null);
      resetForm();
      showStatusMessage('ایده استوری با موفقیت به‌روزرسانی شد!', 3000);
    },
    onError: (error: Error) => {
      showStatusMessage(
        `خطا در به‌روزرسانی ایده استوری: ${error.message}`,
        4000
      );
    },
  });

  // Delete story idea mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/story-ideas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete story idea');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-ideas-admin'] });
      queryClient.invalidateQueries({ queryKey: ['story-ideas'] });
      showStatusMessage('ایده استوری با موفقیت حذف شد!', 3000);
    },
    onError: (error: Error) => {
      showStatusMessage(`خطا در حذف ایده استوری: ${error.message}`, 4000);
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/story-ideas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || 'Failed to toggle story idea status'
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-ideas-admin'] });
      queryClient.invalidateQueries({ queryKey: ['story-ideas'] });
      showStatusMessage('وضعیت ایده استوری تغییر کرد!', 3000);
    },
    onError: (error: Error) => {
      showStatusMessage(`خطا در تغییر وضعیت: ${error.message}`, 4000);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      storyType: '',
      template: '',
      guidelines: '',
      icon: 'Lightbulb',
    });
  };

  const handleCreate = () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      !formData.storyType
    ) {
      showStatusMessage('تمام فیلدهای الزامی را پر کنید!', 3000);
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (idea: StoryIdea) => {
    setEditingIdea(idea);
    setFormData({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      storyType: idea.storyType,
      template: idea.template,
      guidelines: idea.guidelines,
      icon: idea.icon || 'Lightbulb',
    });
  };

  const handleUpdate = () => {
    if (
      !editingIdea ||
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      !formData.storyType
    ) {
      showStatusMessage('تمام فیلدهای الزامی را پر کنید!', 3000);
      return;
    }
    updateMutation.mutate({
      id: editingIdea.id,
      data: formData,
    });
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        'آیا مطمئن هستید که می‌خواهید این ایده استوری را حذف کنید؟'
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      id,
      isActive: !currentStatus,
    });
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingIdea(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff0a54]'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            مدیریت ایده‌های استوری
          </h2>
          <p className='text-gray-600'>
            مدیریت ایده‌های استوری و تنظیمات آن‌ها
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'>
              <Plus className='h-4 w-4 ml-2' />
              افزودن ایده جدید
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>افزودن ایده استوری جدید</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    عنوان ایده
                  </label>
                  <Input
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder='مثال: نظرسنجی روزانه'
                    className='mt-1'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    آیکون
                  </label>
                  <div className='mt-1'>
                    <IconPicker
                      value={formData.icon}
                      onValueChange={icon => setFormData({ ...formData, icon })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  توضیحات
                </label>
                <Textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='توضیحات کوتاه درباره این ایده'
                  className='mt-1'
                  rows={3}
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    دسته‌بندی
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={value =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className='mt-1'>
                      <SelectValue placeholder='انتخاب دسته‌بندی' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    نوع استوری
                  </label>
                  <Select
                    value={formData.storyType}
                    onValueChange={value =>
                      setFormData({ ...formData, storyType: value })
                    }
                  >
                    <SelectTrigger className='mt-1'>
                      <SelectValue placeholder='انتخاب نوع استوری' />
                    </SelectTrigger>
                    <SelectContent>
                      {storyTypes.map(type => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  قالب پیشنهادی
                </label>
                <Textarea
                  value={formData.template}
                  onChange={e =>
                    setFormData({ ...formData, template: e.target.value })
                  }
                  placeholder='قالب پیشنهادی برای استفاده از این ایده'
                  className='mt-1'
                  rows={3}
                />
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  راهنمای استفاده
                </label>
                <Textarea
                  value={formData.guidelines}
                  onChange={e =>
                    setFormData({ ...formData, guidelines: e.target.value })
                  }
                  placeholder='راهنمای کامل برای استفاده از این ایده'
                  className='mt-1'
                  rows={4}
                />
              </div>
              <div className='flex gap-2'>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
                >
                  {createMutation.isPending ? 'در حال ایجاد...' : 'ایجاد'}
                </Button>
                <Button variant='outline' onClick={handleCloseModal}>
                  انصراف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-4'>
        <div className='flex-1 min-w-[200px]'>
          <div className='relative'>
            <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='جستجو در ایده‌ها...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pr-10'
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='دسته‌بندی' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>همه دسته‌ها</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={storyTypeFilter} onValueChange={setStoryTypeFilter}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='نوع استوری' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>همه انواع</SelectItem>
            {storyTypes.map(type => (
              <SelectItem key={type.id} value={type.name}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Story Ideas Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <AnimatePresence>
          {storyIdeas.map(idea => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`${!idea.isActive ? 'opacity-60' : ''}`}>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center'>
                        <DynamicLucideIcon
                          iconName={idea.icon}
                          className='h-4 w-4 text-[#ff0a54]'
                          fallbackIcon={Lightbulb}
                        />
                      </div>
                      <CardTitle className='text-lg'>{idea.title}</CardTitle>
                    </div>
                    <Badge variant={idea.isActive ? 'default' : 'secondary'}>
                      {idea.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                    {idea.description}
                  </p>
                  <div className='flex items-center gap-2 mb-4'>
                    <Badge variant='outline' className='text-xs'>
                      {idea.category}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      {idea.storyType}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleEdit(idea)}
                      className='flex-1'
                    >
                      <Edit className='h-3 w-3 ml-1' />
                      ویرایش
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleToggleActive(idea.id, idea.isActive)}
                      disabled={toggleActiveMutation.isPending}
                    >
                      {idea.isActive ? (
                        <EyeOff className='h-3 w-3' />
                      ) : (
                        <Eye className='h-3 w-3' />
                      )}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleDelete(idea.id)}
                      disabled={deleteMutation.isPending}
                      className='text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingIdea} onOpenChange={() => setEditingIdea(null)}>
        <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>ویرایش ایده استوری</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  عنوان ایده
                </label>
                <Input
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder='مثال: نظرسنجی روزانه'
                  className='mt-1'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  آیکون
                </label>
                <div className='mt-1'>
                  <IconPicker
                    value={formData.icon}
                    onValueChange={icon => setFormData({ ...formData, icon })}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>
                توضیحات
              </label>
              <Textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='توضیحات کوتاه درباره این ایده'
                className='mt-1'
                rows={3}
              />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  دسته‌بندی
                </label>
                <Select
                  value={formData.category}
                  onValueChange={value =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='انتخاب دسته‌بندی' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  نوع استوری
                </label>
                <Select
                  value={formData.storyType}
                  onValueChange={value =>
                    setFormData({ ...formData, storyType: value })
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='انتخاب نوع استوری' />
                  </SelectTrigger>
                  <SelectContent>
                    {storyTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>
                قالب پیشنهادی
              </label>
              <Textarea
                value={formData.template}
                onChange={e =>
                  setFormData({ ...formData, template: e.target.value })
                }
                placeholder='قالب پیشنهادی برای استفاده از این ایده'
                className='mt-1'
                rows={3}
              />
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>
                راهنمای استفاده
              </label>
              <Textarea
                value={formData.guidelines}
                onChange={e =>
                  setFormData({ ...formData, guidelines: e.target.value })
                }
                placeholder='راهنمای کامل برای استفاده از این ایده'
                className='mt-1'
                rows={4}
              />
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
              >
                {updateMutation.isPending
                  ? 'در حال به‌روزرسانی...'
                  : 'به‌روزرسانی'}
              </Button>
              <Button variant='outline' onClick={() => setEditingIdea(null)}>
                انصراف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
