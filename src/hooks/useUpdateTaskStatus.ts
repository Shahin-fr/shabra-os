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
      // Step 1.1: Cancel any outgoing refetches for the tasks query
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Step 1.2: Get a snapshot of the current tasks data from the cache
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // Step 1.3: Manually and immediately update the cache
      if (previousTasks) {
        const updatedTasks = previousTasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              status,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        });
        queryClient.setQueryData(['tasks'], updatedTasks);
      }

      // Step 1.4: Return the previous state snapshot as context
      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      // Rollback: Restore the cache to the previous state snapshot
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }

      toast.error('خطا در بروزرسانی وضعیت تسک', {
        description: error.message,
      });
    },
    onSuccess: (data, variables) => {
      // Show success message
      toast.success('وضعیت تسک با موفقیت بروزرسانی شد', {
        description: `تسک "${data.title}" به وضعیت "${getStatusLabel(variables.status)}" تغییر یافت`,
      });
    },
    onSettled: () => {
      // Cleanup: Refetch the tasks data to ensure perfect sync with server
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
