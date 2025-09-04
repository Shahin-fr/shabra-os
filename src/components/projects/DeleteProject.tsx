'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { projectsKeys } from '@/lib/queries';
import { deleteProject } from '@/lib/queries';
import { showStatusMessage } from '@/lib/utils';
import { Project } from '@/types/project';

interface DeleteProjectProps {
  project: Project;
}

export default function DeleteProject({ project }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Use TanStack Query mutation for deleting projects
  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      return deleteProject(project.id);
    },
    onMutate: async () => {
      // Show loading message
      showStatusMessage('در حال حذف پروژه...', 2000);

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
      showStatusMessage('پروژه با موفقیت حذف شد!', 3000);

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
      showStatusMessage(`خطا در حذف پروژه: ${error.message}`, 4000);

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProjects) {
        context.previousProjects.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  const handleDelete = async () => {
    deleteProjectMutation.mutate();
  };

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setOpen(true)}
        className='text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-8 w-8'
        title='حذف پروژه'
      >
        <Trash2 className='h-4 w-4' />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='text-red-600'>حذف پروژه</DialogTitle>
            <DialogDescription>
              آیا مطمئن هستید که می‌خواهید پروژه "{project.name}" را حذف کنید؟
              <br />
              <span className='text-red-500 font-medium'>
                این عمل قابل بازگشت نیست.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={deleteProjectMutation.isPending}
            >
              انصراف
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? 'در حال حذف...' : 'حذف پروژه'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
