'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Palette } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DynamicLucideIcon } from '@/components/ui/DynamicLucideIcon';
import { IconPicker } from '@/components/ui/icon-picker';
import { showStatusMessage } from '@/lib/utils';

interface StoryType {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StoryTypeFormData {
  name: string;
  icon: string;
  description: string;
}

export function StoryTypeManager() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<StoryType | null>(null);
  const [formData, setFormData] = useState<StoryTypeFormData>({
    name: '',
    icon: 'Palette',
    description: '',
  });

  const queryClient = useQueryClient();

  // Fetch story types
  const { data: storyTypes = [], isLoading } = useQuery<StoryType[]>({
    queryKey: ['story-types-admin'],
    queryFn: async () => {
      const response = await fetch('/api/story-types?includeInactive=true');
      if (!response.ok) throw new Error('Failed to fetch story types');
      return response.json();
    },
  });

  // Create story type mutation
  const createMutation = useMutation({
    mutationFn: async (data: StoryTypeFormData) => {
      const response = await fetch('/api/story-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create story type');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-types-admin'] });
      queryClient.invalidateQueries({ queryKey: ['story-types'] });
      setIsCreateModalOpen(false);
      resetForm();
      showStatusMessage('نوع استوری با موفقیت ایجاد شد!', 3000);
    },
    onError: (error: Error) => {
      showStatusMessage(`خطا در ایجاد نوع استوری: ${error.message}`, 4000);
    },
  });

  // Update story type mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StoryTypeFormData> }) => {
      const response = await fetch(`/api/story-types/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update story type');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-types-admin'] });
      queryClient.invalidateQueries({ queryKey: ['story-types'] });
      setEditingType(null);
      resetForm();
      showStatusMessage('نوع استوری با موفقیت به‌روزرسانی شد!', 3000);
    },
    onError: (error: Error) => {
      showStatusMessage(`خطا در به‌روزرسانی نوع استوری: ${error.message}`, 4000);
    },
  });

  // Delete story type mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/story-types/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete story type');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-types-admin'] });
      queryClient.invalidateQueries({ queryKey: ['story-types'] });
      showStatusMessage('نوع استوری با موفقیت حذف شد!', 3000);
    },
    onError: (error: Error) => {
      showStatusMessage(`خطا در حذف نوع استوری: ${error.message}`, 4000);
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/story-types/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to toggle story type status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-types-admin'] });
      queryClient.invalidateQueries({ queryKey: ['story-types'] });
      showStatusMessage('وضعیت نوع استوری تغییر کرد!', 3000);
    },
    onError: (error: Error) => {
      showStatusMessage(`خطا در تغییر وضعیت: ${error.message}`, 4000);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'Palette',
      description: '',
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      showStatusMessage('نام نوع استوری الزامی است!', 3000);
      return;
    }
    
    // Add timestamp to make name unique
    const uniqueName = `${formData.name.trim()} (${new Date().toISOString().slice(0, 19).replace('T', ' ')})`;
    
    createMutation.mutate({
      ...formData,
      name: uniqueName,
    });
  };

  const handleEdit = (storyType: StoryType) => {
    setEditingType(storyType);
    setFormData({
      name: storyType.name,
      icon: storyType.icon || 'Palette',
      description: storyType.description || '',
    });
  };

  const handleUpdate = () => {
    if (!editingType || !formData.name.trim()) {
      showStatusMessage('نام نوع استوری الزامی است!', 3000);
      return;
    }
    updateMutation.mutate({
      id: editingType.id,
      data: formData,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این نوع استوری را حذف کنید؟')) {
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
    setEditingType(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff0a54]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">مدیریت انواع استوری</h2>
          <p className="text-gray-600">مدیریت انواع استوری و تنظیمات آن‌ها</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white">
              <Plus className="h-4 w-4 ml-2" />
              افزودن نوع جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>افزودن نوع استوری جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">نام نوع استوری</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: تعامل با مخاطب"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">آیکون</label>
                <div className="mt-1">
                  <IconPicker
                    value={formData.icon}
                    onValueChange={(icon) => setFormData({ ...formData, icon })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">توضیحات</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات کوتاه درباره این نوع استوری"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white"
                >
                  {createMutation.isPending ? 'در حال ایجاد...' : 'ایجاد'}
                </Button>
                <Button variant="outline" onClick={handleCloseModal}>
                  انصراف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Story Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {storyTypes.map((storyType) => (
            <motion.div
              key={storyType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`${!storyType.isActive ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center">
                        <DynamicLucideIcon
                          iconName={storyType.icon}
                          className="h-4 w-4 text-[#ff0a54]"
                          fallbackIcon={Palette}
                        />
                      </div>
                      <CardTitle className="text-lg">{storyType.name}</CardTitle>
                    </div>
                    <Badge variant={storyType.isActive ? 'default' : 'secondary'}>
                      {storyType.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {storyType.description && (
                    <p className="text-sm text-gray-600 mb-4">{storyType.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(storyType)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 ml-1" />
                      ویرایش
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(storyType.id, storyType.isActive)}
                      disabled={toggleActiveMutation.isPending}
                    >
                      {storyType.isActive ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(storyType.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingType} onOpenChange={() => setEditingType(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ویرایش نوع استوری</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">نام نوع استوری</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: تعامل با مخاطب"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">آیکون</label>
              <div className="mt-1">
                <IconPicker
                  value={formData.icon}
                  onValueChange={(icon) => setFormData({ ...formData, icon })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">توضیحات</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="توضیحات کوتاه درباره این نوع استوری"
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white"
              >
                {updateMutation.isPending ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی'}
              </Button>
              <Button variant="outline" onClick={() => setEditingType(null)}>
                انصراف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
