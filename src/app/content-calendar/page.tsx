"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";
import { formatJalaliDate, formatJalaliMonthYear, persianDays } from "@/lib/date-utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, FileText, Image, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useStatusStore } from "@/stores/statusStore";
import { contentCalendarKeys, fetchContentSlotsByWeek } from "@/lib/queries";

// Content type options
const contentTypes = [
  { value: "STORY", label: "استوری", icon: Image },
  { value: "POST", label: "پست", icon: FileText }
];

interface ContentSlot {
  id: string;
  title: string;
  type: "STORY" | "POST";
  dayOfWeek: number;
  weekStart: string;
  order: number;
  notes?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateContentData {
  title: string;
  type: "STORY" | "POST";
  dayOfWeek: number;
  weekStart: string;
  notes?: string;
}

export default function ContentCalendarPage() {
  const [currentWeek, setCurrentWeek] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 6 }); // Saturday
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentSlot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedContent, setDraggedContent] = useState<ContentSlot | null>(null);

  const { setStatus } = useStatusStore();
  const queryClient = useQueryClient();

  // Generate week days starting from Saturday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(currentWeek, i);
    return {
      date: day,
      dayOfWeek: i,
      persianName: persianDays[i],
      gregorianDate: format(day, "MMM d"),
      jalaliDate: formatJalaliDate(day, 'M/d')
    };
  });

  // Fetch content slots for the current week
  const { data: contentSlots = [] } = useQuery({
    queryKey: contentCalendarKeys.byWeek(format(currentWeek, "yyyy-MM-dd")),
    queryFn: () => fetchContentSlotsByWeek(format(currentWeek, "yyyy-MM-dd")),
  });

  // Create content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: CreateContentData) => {
      const response = await fetch("/api/content-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create content");
      return response.json();
    },
    onSuccess: () => {
      // Fix Issue 1: Invalidate all content calendar queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: contentCalendarKeys.all });
      setIsCreateDialogOpen(false);
      setStatus('success', 'محتوای جدید با موفقیت ایجاد شد!');
    },
    onError: () => {
      setStatus('error', 'خطا در ایجاد محتوا. لطفاً دوباره تلاش کنید.');
    }
  });

  // Update content mutation
  const updateContentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateContentData> }) => {
      const response = await fetch(`/api/content-slots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      // Fix Issue 1: Invalidate all content calendar queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: contentCalendarKeys.all });
      setIsCreateDialogOpen(false);
      setEditingContent(null);
      setIsEditing(false);
      setStatus('success', 'محتوا با موفقیت بروزرسانی شد!');
    },
    onError: () => {
      setStatus('error', 'خطا در بروزرسانی محتوا. لطفاً دوباره تلاش کنید.');
    }
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/content-slots/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete content");
      return response.json();
    },
    onSuccess: () => {
      // Fix Issue 1: Invalidate all content calendar queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: contentCalendarKeys.all });
      setStatus('success', 'محتوا با موفقیت حذف شد!');
    },
    onError: () => {
      setStatus('error', 'خطا در حذف محتوا. لطفاً دوباره تلاش کنید.');
    }
  });

  // Handle drag and drop
  const handleDragStart = (content: ContentSlot) => {
    setDraggedContent(content);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDayOfWeek: number) => {
    e.preventDefault();
    if (!draggedContent) return;

    if (draggedContent.dayOfWeek !== targetDayOfWeek) {
      await updateContentMutation.mutateAsync({
        id: draggedContent.id,
        data: { dayOfWeek: targetDayOfWeek }
      });
    }
    setDraggedContent(null);
  };

  // Navigation
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 6 }));
  };

  // Get content for a specific day
  const getContentForDay = (dayOfWeek: number) => {
    return contentSlots
      .filter((content: ContentSlot) => content.dayOfWeek === dayOfWeek)
      .sort((a: ContentSlot, b: ContentSlot) => a.order - b.order);
  };

  // Handle form submission
  const handleSubmit = (formData: CreateContentData) => {
    if (isEditing && editingContent) {
      updateContentMutation.mutate({ id: editingContent.id, data: formData });
    } else {
      createContentMutation.mutate(formData);
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingContent(null);
    setIsEditing(false);
    setIsCreateDialogOpen(false);
  };

  return (
    <motion.div
      className="container mx-auto max-w-7xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.2),
                0 10px 30px rgba(255, 10, 84, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.4)
              `
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">تقویم محتوا</h1>
                  <p className="text-muted-foreground">برنامه‌ریزی هفتگی محتوا و استوری‌ها</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={goToCurrentWeek}
                    variant="outline"
                    className="bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200 hover:border-pink-300"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-pink-600" />
                    هفته جاری
                  </Button>
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                        <Plus className="mr-2 h-4 w-4" />
                        محتوای جدید
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>
                          {isEditing ? 'ویرایش محتوا' : 'محتوای جدید'}
                        </DialogTitle>
                      </DialogHeader>
                      <ContentForm
                        onSubmit={handleSubmit}
                        onCancel={resetForm}
                        editingContent={editingContent}
                        weekDays={weekDays}
                        currentWeek={currentWeek}
                        isLoading={createContentMutation.isPending || updateContentMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Week Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  onClick={goToPreviousWeek}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-[#ff0a54]/10"
                >
                  هفته قبل
                </Button>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    {formatJalaliMonthYear(currentWeek)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatJalaliDate(currentWeek, 'M/d')} - {formatJalaliDate(addDays(currentWeek, 6), 'M/d/yyyy')}
                  </p>
                </div>
                
                <Button
                  onClick={goToNextWeek}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-[#ff0a54]/10"
                >
                  هفته بعد
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Kanban Board */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-7 gap-4"
        >
          {weekDays.map((day, index) => (
            <motion.div
              key={day.dayOfWeek}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="flex flex-col"
            >
              {/* Day Header */}
              <Card
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
                className="mb-3"
              >
                <CardContent className="p-3 text-center">
                  <div className="text-sm font-medium text-foreground mb-1">
                    {day.persianName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {day.jalaliDate} / {day.gregorianDate}
                  </div>
                </CardContent>
              </Card>

              {/* Content Column */}
              <div
                className="min-h-[400px] bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3"
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, day.dayOfWeek)}
              >
                <AnimatePresence>
                  {getContentForDay(day.dayOfWeek).map((content: ContentSlot) => (
                    <motion.div
                      key={content.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      draggable
                      onDragStart={() => handleDragStart(content)}
                      className="mb-3"
                    >
                      <ContentCard
                        content={content}
                        onEdit={() => {
                          setEditingContent(content);
                          setIsEditing(true);
                          setIsCreateDialogOpen(true);
                        }}
                        onDelete={() => deleteContentMutation.mutate(content.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {getContentForDay(day.dayOfWeek).length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>محتوایی برای این روز وجود ندارد</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
  );
}

// Content Card Component
function ContentCard({ content, onEdit, onDelete }: {
  content: ContentSlot;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeConfig = contentTypes.find(t => t.value === content.type);
  const TypeIcon = typeConfig?.icon || FileText;

  return (
    <Card 
      className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all cursor-pointer group"
      onDoubleClick={onEdit}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-0.5">
            <TypeIcon className="h-4 w-4 text-[#ff0a54]" />
            <Badge variant="secondary" className="text-xs">
              {typeConfig?.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-500"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col justify-center items-center text-center">
          <h4 className="font-bold text-foreground text-sm mb-2 line-clamp-2">
            {content.title}
          </h4>
          
          {content.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {content.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Content Form Component
function ContentForm({ onSubmit, onCancel, editingContent, weekDays, currentWeek, isLoading }: {
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: CreateContentData) => void;
  onCancel: () => void;
  editingContent: ContentSlot | null;
  weekDays: any[];
  currentWeek: Date;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateContentData>({
    title: editingContent?.title || "",
    type: editingContent?.type || "STORY",
    dayOfWeek: editingContent?.dayOfWeek || 0,
    weekStart: editingContent?.weekStart || format(currentWeek, "yyyy-MM-dd"),
    notes: editingContent?.notes || ""
  });

  useEffect(() => {
    if (editingContent) {
      setFormData({
        title: editingContent.title,
        type: editingContent.type,
        dayOfWeek: editingContent.dayOfWeek,
        weekStart: editingContent.weekStart,
        notes: editingContent.notes || ""
      });
    } else {
      // For new content, always use current week
      setFormData(prev => ({
        ...prev,
        weekStart: format(currentWeek, "yyyy-MM-dd")
      }));
    }
  }, [editingContent, currentWeek]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">عنوان</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="عنوان محتوا"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="type">نوع</Label>
        <Select
          value={formData.type}
          onValueChange={(value: "STORY" | "POST") => 
            setFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {contentTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="dayOfWeek">روز هفته</Label>
        <Select
          value={formData.dayOfWeek.toString()}
          onValueChange={(value) => 
            setFormData(prev => ({ ...prev, dayOfWeek: parseInt(value) }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {weekDays.map((day) => (
              <SelectItem key={day.dayOfWeek} value={day.dayOfWeek.toString()}>
                {day.persianName} ({day.jalaliDate})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="notes">یادداشت‌ها</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="یادداشت‌های مربوط به محتوا"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-pink-100 text-pink-700 hover:bg-pink-200">
          {isLoading ? "در حال ذخیره..." : (editingContent ? "بروزرسانی" : "ایجاد")}
        </Button>
      </div>
    </form>
  );
}
