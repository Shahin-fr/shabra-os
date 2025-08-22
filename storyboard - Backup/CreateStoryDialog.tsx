"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

interface StoryType {
  id: string;
  name: string;
}

interface Story {
  id: string;
  title: string;
  notes?: string;
  caption?: string;
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

interface CreateStoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (storyData: {
    title: string;
    notes?: string;
    visualNotes?: string;
    link?: string;
    storyTypeId?: string;
  }) => void;
  storyTypes: StoryType[];
  isLoading?: boolean;
  editingStory?: Story | null;
  isEditing?: boolean;
}

export function CreateStoryDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  storyTypes,
  isLoading = false,
  editingStory = null,
  isEditing = false,
}: CreateStoryDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    notes: "",
    visualNotes: "",
    link: "",
    storyTypeId: "",
  });

  // Update form data when editing story changes
  useEffect(() => {
    if (editingStory && isEditing) {
      setFormData({
        title: editingStory.title || "",
        notes: editingStory.notes || "",
        visualNotes: editingStory.visualNotes || "",
        link: editingStory.link || "",
        storyTypeId: editingStory.storyType?.id || "",
      });
    } else {
      setFormData({
        title: "",
        notes: "",
        visualNotes: "",
        link: "",
        storyTypeId: "",
      });
    }
  }, [editingStory, isEditing]);

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    onSubmit({
      title: formData.title,
      notes: formData.notes || undefined,
      visualNotes: formData.visualNotes || undefined,
      link: formData.link || undefined,
      storyTypeId: formData.storyTypeId || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] border-0 p-0 overflow-hidden bg-white"
        style={{
          boxShadow: `
            0 25px 80px rgba(0, 0, 0, 0.1),
            0 15px 40px rgba(0, 0, 0, 0.05)
          `
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="p-6"
        >
          <DialogTitle className="text-xl font-bold text-gray-900 mb-6">
            {isEditing ? "ویرایش استوری" : "ایجاد استوری جدید"}
          </DialogTitle>
          
          <motion.div 
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.1
                }
              }
            }}
          >
            {/* Title Field */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                عنوان استوری *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان استوری را وارد کنید"
                className="mt-2 bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50"
              />
            </motion.div>

            {/* Story Type Field */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              <Label htmlFor="storyType" className="text-sm font-semibold text-gray-700">
                نوع استوری
              </Label>
              <Select
                value={formData.storyTypeId}
                onValueChange={(value) => setFormData({ ...formData, storyTypeId: value })}
              >
                <SelectTrigger className="mt-2 bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50">
                  <SelectValue placeholder="نوع استوری را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {storyTypes.map((storyType) => (
                    <SelectItem key={storyType.id} value={storyType.id}>
                      {storyType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Notes Field */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                یادداشت‌ها
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="یادداشت‌های مربوط به استوری"
                className="mt-2 bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50"
                rows={3}
              />
            </motion.div>



            {/* Visual Notes Field */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              <Label htmlFor="visualNotes" className="text-sm font-semibold text-gray-700">
                یادداشت‌های بصری
              </Label>
              <Textarea
                id="visualNotes"
                value={formData.visualNotes}
                onChange={(e) => setFormData({ ...formData, visualNotes: e.target.value })}
                placeholder="توضیحات بصری و تصویری"
                className="mt-2 bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50"
                rows={2}
              />
            </motion.div>

            {/* Link Field */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              <Label htmlFor="link" className="text-sm font-semibold text-gray-700">
                لینک
              </Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="لینک مرتبط با استوری"
                className="mt-2 bg-gray-50 border-gray-200 focus:border-[#ff0a54]/50"
              />
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex items-center justify-end gap-3 pt-4"
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <DialogClose asChild>
                              <Button 
                variant="outline" 
                className="border-gray-300 hover:border-[#ff0a54]/50 bg-white hover:bg-gray-50"
              >
                انصراف
              </Button>
              </DialogClose>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !formData.title.trim()}
                className="bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white shadow-lg hover:shadow-xl"
              >
                {isLoading ? "در حال ذخیره..." : isEditing ? "بروزرسانی" : "ایجاد"}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
