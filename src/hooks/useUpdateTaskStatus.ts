import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UpdateTaskStatusParams {
  taskId: string;
  status: 'Todo' | 'InProgress' | 'Done';
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'Todo' | 'InProgress' | 'Done';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo: string | null;
  projectId: string | null;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
}

const updateTaskStatus = async ({
  taskId,
  status,
}: UpdateTaskStatusParams): Promise<Task> => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'خطا در بروزرسانی وضعیت تسک');
  }

  return response.json();
};

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskStatus,
    onMutate: async ({ taskId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // Optimistically update the cache
      if (previousTasks) {
        const updatedTasks = previousTasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        );
        queryClient.setQueryData(['tasks'], updatedTasks);
      }

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }

      toast.error('خطا در بروزرسانی وضعیت تسک', {
        description: error.message,
      });
    },
    onSuccess: (data, variables) => {
      toast.success('وضعیت تسک با موفقیت بروزرسانی شد', {
        description: `تسک "${data.title}" به وضعیت "${getStatusLabel(variables.status)}" تغییر یافت`,
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

function getStatusLabel(status: string): string {
  const statusLabels = {
    Todo: 'انجام نشده',
    InProgress: 'در حال انجام',
    Done: 'انجام شده',
  };
  return statusLabels[status as keyof typeof statusLabels] || status;
}
