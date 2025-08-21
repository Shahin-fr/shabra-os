"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsKeys } from "@/lib/queries";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateTaskProps {
  projectId: string;
  trigger?: React.ReactNode;
  mode?: "create" | "view" | "edit";
  taskData?: {
    title: string;
    description: string;
    assignedTo?: string;
  };
}

export default function CreateTask({ 
  projectId, 
  trigger, 
  mode = "create",
  taskData 
}: CreateTaskProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: taskData?.title || "",
    description: taskData?.description || "",
    assigneeId: taskData?.assignedTo || "",
  });
  const queryClient = useQueryClient();

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch {
        // Silent error handling
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Use TanStack Query mutation for creating tasks
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; description: string; assigneeId: string }) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskData,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در ایجاد وظیفه");
      }

      return response.json();
    },
    // Simplified approach - no optimistic updates for now, focus on cache invalidation
    // onMutate: async (newTaskData) => {
    //   console.log("🚀 Starting optimistic update for new task:", newTaskData);
    //   return { previousProject: null };
    // },
    onSuccess: async () => {
      // Reset form
      setFormData({ title: "", description: "", assigneeId: "" });
      
      // Close dialog
      setOpen(false);
      
      // Invalidate and refetch to get the real data from the server
      try {
        // Invalidate all related queries
        await queryClient.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
        
        // Force a refetch to ensure fresh data
        await queryClient.refetchQueries({ 
          queryKey: projectsKeys.detail(projectId),
          type: 'active' 
        });
      } catch {
        // Silent error handling for query invalidation
      }
    },
    onError: () => {
      alert("خطا در ایجاد وظیفه. لطفاً دوباره تلاش کنید.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      assigneeId: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg">وظیفه جدید</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "ایجاد وظیفه جدید" : "جزئیات وظیفه"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "اطلاعات وظیفه جدید را وارد کنید" 
              : "جزئیات وظیفه"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                عنوان
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="عنوان وظیفه را وارد کنید"
                required
                disabled={mode === "view" || createTaskMutation.isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                توضیحات
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="توضیحات وظیفه را وارد کنید"
                rows={3}
                disabled={mode === "view" || createTaskMutation.isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                مسئول
              </Label>
              <Select
                value={formData.assigneeId}
                onValueChange={handleSelectChange}
                disabled={mode === "view" || createTaskMutation.isPending}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="انتخاب مسئول" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {mode === "create" && (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createTaskMutation.isPending}
              >
                انصراف
              </Button>
                           <Button type="submit" disabled={createTaskMutation.isLoading} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700">
                               {createTaskMutation.isPending ? "در حال ایجاد..." : "ایجاد وظیفه"}
             </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
