'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { isAdminOrManager } from '@/lib/auth-utils';
import { projectsKeys } from '@/lib/queries';
import { showStatusMessage } from '@/lib/utils';

export default function CreateProject() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const queryClient = useQueryClient();

  // Use TanStack Query mutation for creating projects
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description: string }) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        // Error handling is done in the mutation's onError callback
        throw new Error(
          `خطا در ایجاد پروژه: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      // Extract data from the API response structure
      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Invalid response structure from project creation API');
    },
    onMutate: async () => {
      // Show loading message
      showStatusMessage('در حال ایجاد پروژه...', 2000);

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
    onSuccess: _data => {
      // Show success message
      showStatusMessage('پروژه با موفقیت ایجاد شد!', 3000);

      // Reset form
      setFormData({ name: '', description: '' });

      // Close dialog
      setOpen(false);

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
      showStatusMessage(`خطا در ایجاد پروژه: ${error.message}`, 4000);

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProjects) {
        context.previousProjects.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  // Check if user has permission to create projects
  const canCreateProject =
    user &&
    isAdminOrManager({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        roles: user.roles || [],
      },
    } as any);

  // If user doesn't have permission, don't render the component
  if (!canCreateProject) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg'>
          پروژه جدید
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>ساخت پروژه جدید</DialogTitle>
          <DialogDescription>اطلاعات پروژه جدید را وارد کنید</DialogDescription>
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
                disabled={createProjectMutation.isPending}
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
                disabled={createProjectMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={createProjectMutation.isPending}
            >
              انصراف
            </Button>
            <Button
              type='submit'
              disabled={createProjectMutation.isPending}
              className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
            >
              {createProjectMutation.isPending
                ? 'در حال ایجاد...'
                : 'ایجاد پروژه'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

