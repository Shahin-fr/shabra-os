'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { projectsKeys } from '@/lib/queries';
import { updateProject } from '@/lib/queries';
import { showStatusMessage } from '@/lib/utils';
import { Project } from '@/types/project';

interface EditProjectProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProject({
  project,
  open,
  onOpenChange,
}: EditProjectProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const queryClient = useQueryClient();

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
      });
    }
  }, [project]);

  // Use TanStack Query mutation for updating projects
  const updateProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description: string }) => {
      return updateProject(project.id, projectData);
    },
    onMutate: async () => {
      // Show loading message
      showStatusMessage('در حال به‌روزرسانی پروژه...', 2000);

      // Cancel any outgoing refetches for all project queries
      await queryClient.cancelQueries({
        queryKey: projectsKeys.all,
        exact: false,
      });

      // Snapshot the previous value for all project queries
      const previousProjects = queryClient.getQueriesData({
        queryKey: projectsKeys.all,
        exact: false,
      });

      return { previousProjects };
    },
    onSuccess: () => {
      // Show success message
      showStatusMessage('پروژه با موفقیت به‌روزرسانی شد!', 3000);

      // Close dialog
      onOpenChange(false);

      // Invalidate and refetch all projects queries to update the UI
      // This includes both paginated and non-paginated queries
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      queryClient.refetchQueries({ queryKey: projectsKeys.all });

      // Also invalidate specific page queries to ensure pagination updates
      queryClient.invalidateQueries({
        queryKey: projectsKeys.all,
        exact: false,
      });
    },
    onError: (error, _variables, context) => {
      // Error handling is done in the mutation's onError callback
      // Show error message
      showStatusMessage(`خطا در به‌روزرسانی پروژه: ${error.message}`, 4000);

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProjects) {
        context.previousProjects.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate(formData);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>ویرایش پروژه</DialogTitle>
          <DialogDescription>اطلاعات پروژه را ویرایش کنید</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-end'>
                نام پروژه
              </Label>
              <Input
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                className='col-span-3'
                placeholder='نام پروژه را وارد کنید'
                required
                disabled={updateProjectMutation.isPending}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='description' className='text-end'>
                توضیحات
              </Label>
              <Textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                className='col-span-3'
                rows={3}
                placeholder='توضیحات پروژه را وارد کنید'
                disabled={updateProjectMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={updateProjectMutation.isPending}
            >
              انصراف
            </Button>
            <Button
              type='submit'
              disabled={updateProjectMutation.isPending}
              className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
            >
              {updateProjectMutation.isPending
                ? 'در حال به‌روزرسانی...'
                : 'به‌روزرسانی پروژه'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

