"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsKeys } from "@/lib/queries";

export default function CreateProject() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use TanStack Query mutation for creating projects
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description: string }) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error("خطا در ایجاد پروژه");
      }

      return response.json();
    },
    onMutate: async (newProjectData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectsKeys.all });
      
      // Snapshot the previous value
      const previousProjects = queryClient.getQueriesData({ queryKey: projectsKeys.all });
      
      // Optimistically update the first page (where new projects should appear)
      queryClient.setQueryData(projectsKeys.byPage(1), (old: any) => {
        if (!old || !old.projects) return old;
        
        const newProject = {
          id: `temp-${Date.now()}`, // Temporary ID
          name: newProjectData.name,
          description: newProjectData.description,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { stories: 0, tasks: 0 }
        };
        
        const updatedData = {
          ...old,
          projects: [newProject, ...old.projects],
          totalProjects: old.totalProjects + 1,
          totalPages: Math.ceil((old.totalProjects + 1) / 20)
        };
        
        return updatedData;
      });
      
      return { previousProjects };
    },
    onSuccess: () => {
      // Reset form
      setFormData({ name: "", description: "" });
      
      // Close dialog
      setOpen(false);
      
      // Invalidate and refetch to get the real data from the server
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      
      // Redirect to first page where the new project will appear
      router.push("/projects");
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousProjects) {
        context.previousProjects.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      alert("خطا در ایجاد پروژه. لطفاً دوباره تلاش کنید.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg">
          پروژه جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ساخت پروژه جدید</DialogTitle>
          <DialogDescription>
            اطلاعات پروژه جدید را وارد کنید
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                نام پروژه
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="نام پروژه را وارد کنید"
                required
                disabled={createProjectMutation.isPending}
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
                placeholder="توضیحات پروژه را وارد کنید"
                rows={3}
                disabled={createProjectMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createProjectMutation.isPending}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white"
            >
              {createProjectMutation.isPending ? "در حال ایجاد..." : "ایجاد پروژه"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
