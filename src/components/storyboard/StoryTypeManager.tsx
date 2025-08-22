"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/ui/IconPicker";
import { DynamicLucideIcon } from "@/components/ui/DynamicLucideIcon";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  Users,
  BarChart3,
  Target,
  Sparkles
} from "lucide-react";
import { isAdmin } from "@/lib/utils";

// Mock icon mapping - you can expand this based on your needs
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "news": FileText,
  "feature": Sparkles,
  "event": Calendar,
  "team": Users,
  "analytics": BarChart3,
  "goal": Target,
  "default": FileText
};

// Helper function to get fallback icon based on story type name
const getFallbackIcon = (storyTypeName: string): React.ComponentType<{ className?: string }> => {
  const name = storyTypeName.toLowerCase();
  
  if (name.includes('خبر') || name.includes('news')) return FileText;
  if (name.includes('ویژگی') || name.includes('feature')) return Sparkles;
  if (name.includes('رویداد') || name.includes('event')) return Calendar;
  if (name.includes('تیم') || name.includes('team')) return Users;
  if (name.includes('تحلیل') || name.includes('analytics')) return BarChart3;
  if (name.includes('هدف') || name.includes('goal')) return Target;
  
  return FileText; // default fallback
};

interface StoryType {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    stories: number;
  };
}

// Fetch story types from API
const fetchStoryTypes = async (): Promise<StoryType[]> => {
  const response = await fetch('/api/story-types');
  if (!response.ok) {
    throw new Error('Failed to fetch story types');
  }
  return response.json();
};

export default function StoryTypeManager() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [editingStoryType, setEditingStoryType] = useState<StoryType | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Check if user has admin role
  const hasAdminAccess = session?.user && (session.user as any).role && isAdmin((session.user as any).role);

  // Fetch story types using TanStack Query
  const { 
    data: storyTypes = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['storyTypes'],
    queryFn: fetchStoryTypes,
    enabled: isOpen && hasAdminAccess, // Only fetch when dialog is open and user is admin
  });

  // Create story type mutation
  const createStoryTypeMutation = useMutation({
    mutationFn: async (data: { name: string; icon?: string }) => {
      const response = await fetch('/api/story-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create story type');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch story types
      queryClient.invalidateQueries({ queryKey: ['storyTypes'] });
      // Reset form
      setFormData({ name: '', icon: '' });
      setEditingStoryType(null);
    },
  });

  // Update story type mutation
  const updateStoryTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; icon?: string } }) => {
      const response = await fetch(`/api/story-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update story type');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch story types
      queryClient.invalidateQueries({ queryKey: ['storyTypes'] });
      // Reset form
      setFormData({ name: '', icon: '' });
      setEditingStoryType(null);
    },
  });

  // Delete story type mutation
  const deleteStoryTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/story-types/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete story type');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch story types
      queryClient.invalidateQueries({ queryKey: ['storyTypes'] });
    },
  });

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear form error when user starts typing
    if (formError) {
      setFormError(null);
    }
  };

  // Handle edit button click
  const handleEdit = (storyType: StoryType) => {
    setEditingStoryType(storyType);
    setFormData({ 
      name: storyType.name, 
      icon: (storyType as any).icon || '' // Load existing icon if available
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormError('نام نوع استوری الزامی است');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    
    try {
      if (editingStoryType) {
        // Update existing story type
        await updateStoryTypeMutation.mutateAsync({
          id: editingStoryType.id,
          data: { 
            name: formData.name.trim(),
            icon: formData.icon || undefined
          }
        });
      } else {
        // Create new story type
        await createStoryTypeMutation.mutateAsync({
          name: formData.name.trim(),
          icon: formData.icon || undefined
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormError(error instanceof Error ? error.message : 'خطای ناشناخته');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingStoryType(null);
    setFormData({ name: '', icon: '' });
  };

  // Handle delete
  const handleDelete = async (storyType: StoryType) => {
    if (!window.confirm(`آیا مطمئن هستید که می‌خواهید نوع استوری "${storyType.name}" را حذف کنید؟`)) {
      return;
    }

    try {
      await deleteStoryTypeMutation.mutateAsync(storyType.id);
    } catch (error) {
      console.error('Error deleting story type:', error);
      // Error is already handled by the mutation's onError
    }
  };

  // If user doesn't have admin access, don't render the component
  if (!hasAdminAccess) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          مدیریت قالب‌ها
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            مدیریت انواع استوری
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Story Types List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">انواع موجود</h3>
              <Button 
                onClick={() => {
                  setEditingStoryType(null);
                  setFormData({ name: '', icon: '' });
                }}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                افزودن نوع جدید
              </Button>
            </div>

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">در حال بارگذاری...</p>
              </div>
            )}

            {isError && (
              <div className="text-center py-8">
                <p className="text-destructive">خطا در بارگذاری انواع استوری</p>
                <p className="text-sm text-muted-foreground">{error?.message}</p>
              </div>
            )}

            {!isLoading && !isError && storyTypes.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">هیچ نوع استوری تعریف نشده است</p>
                <p className="text-sm text-muted-foreground">برای شروع، نوع جدیدی اضافه کنید</p>
              </div>
            )}

            {!isLoading && !isError && storyTypes.length > 0 && (
              <div className="space-y-3">
                {storyTypes.map((storyType) => (
                  <Card key={storyType.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                                                         <DynamicLucideIcon 
                               iconName={storyType.icon} 
                               className="h-4 w-4" 
                               fallbackIcon={getFallbackIcon(storyType.name)}
                             />
                          </div>
                          <div>
                            <h4 className="font-medium">{storyType.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {storyType._count?.stories || 0} استوری
                              </Badge>
                              <span>•</span>
                              <span>
                                {new Date(storyType.updatedAt).toLocaleDateString('fa-IR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(storyType)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(storyType)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            disabled={deleteStoryTypeMutation.isPending}
                          >
                            {deleteStoryTypeMutation.isPending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Create/Edit Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {editingStoryType ? 'ویرایش نوع استوری' : 'افزودن نوع جدید'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{formError}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">نام نوع استوری</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="مثال: اخبار، ویژگی، رویداد"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">آیکون (اختیاری)</Label>
                <IconPicker
                  currentIcon={formData.icon}
                  onSelectIcon={(iconName) => handleInputChange('icon', iconName)}
                />
                <p className="text-xs text-muted-foreground">
                  آیکون مورد نظر خود را از لیست انتخاب کنید
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting || !formData.name.trim()}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingStoryType ? 'در حال بروزرسانی...' : 'در حال افزودن...'}
                    </div>
                  ) : (
                    editingStoryType ? 'بروزرسانی' : 'افزودن'
                  )}
                </Button>
                
                {editingStoryType && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                  >
                    لغو
                  </Button>
                )}
              </div>
            </form>

            {/* Icon Preview */}
            {formData.icon && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium">پیش‌نمایش آیکون:</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                                         <DynamicLucideIcon 
                       iconName={formData.icon} 
                       className="h-5 w-5" 
                     />
                    <span className="text-sm">{formData.icon}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
