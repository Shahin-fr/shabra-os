'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';

import {
  MobileFormModal,
  MobileFormField,
  MobileInput,
  MobileTextarea,
} from '@/components/forms';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { isAdminOrManager } from '@/lib/auth-utils';
import { projectsKeys } from '@/lib/queries';
import { showStatusMessage } from '@/lib/utils';

interface MobileCreateProjectProps {
  className?: string;
}

export function MobileCreateProject({}: MobileCreateProjectProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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
        throw new Error(
          `خطا در ایجاد پروژه: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Invalid response structure from project creation API');
    },
    onMutate: async () => {
      showStatusMessage('در حال ایجاد پروژه...', 2000);

      await queryClient.cancelQueries({
        queryKey: projectsKeys.all,
        exact: false,
      });

      const previousProjects = queryClient.getQueriesData({
        queryKey: projectsKeys.all,
        exact: false,
      });

      return { previousProjects };
    },
    onSuccess: () => {
      showStatusMessage('پروژه با موفقیت ایجاد شد!', 3000);
      setFormData({ name: '', description: '' });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      queryClient.refetchQueries({ queryKey: projectsKeys.all });
    },
    onError: (error, _variables, context) => {
      showStatusMessage(`خطا در ایجاد پروژه: ${error.message}`, 4000);

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
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    } as any);

  // If user doesn't have permission, don't render the component
  if (!canCreateProject) {
    return null;
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
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
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className='bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg h-12 px-6'
      >
        <Plus className='h-5 w-5 ml-2' />
        پروژه جدید
      </Button>

      <MobileFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='ساخت پروژه جدید'
        onSubmit={handleSubmit}
        submitLabel='ایجاد پروژه'
        isLoading={createProjectMutation.isPending}
      >
        <MobileFormField label='نام پروژه' required>
          <MobileInput
            name='name'
            value={formData.name}
            onChange={handleInputChange}
            placeholder='نام پروژه را وارد کنید'
            required
            disabled={createProjectMutation.isPending}
          />
        </MobileFormField>

        <MobileFormField label='توضیحات'>
          <MobileTextarea
            name='description'
            value={formData.description}
            onChange={handleInputChange}
            placeholder='توضیحات پروژه را وارد کنید'
            disabled={createProjectMutation.isPending}
          />
        </MobileFormField>
      </MobileFormModal>
    </>
  );
}
