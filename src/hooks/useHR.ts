import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, LeaveRequest, AttendanceRecord } from '@/types/hr';

// Common query keys
export const HR_QUERY_KEYS = {
  users: ['users'] as const,
  employees: ['employees'] as const,
  leaveRequests: ['leave-requests'] as const,
  adminLeaveRequests: (filters?: any) => ['admin-leave-requests', filters] as const,
  attendanceStatus: ['attendanceStatus'] as const,
  attendanceStats: ['attendanceStats'] as const,
  adminAttendanceStats: ['admin-attendance-stats'] as const,
  adminAttendance: (filters?: any, page?: number, limit?: number) => 
    ['admin-attendance', filters, page, limit] as const,
} as const;

// Common API functions
export const hrApi = {
  // Users
  fetchUsers: async (): Promise<User[]> => {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const result = await response.json();
    return result.data || [];
  },

  createUser: async (userData: any): Promise<User> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create user');
    }
    const result = await response.json();
    return result.data;
  },

  // Leave Requests
  fetchLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const response = await fetch('/api/leave-requests');
    if (!response.ok) throw new Error('Failed to fetch leave requests');
    const result = await response.json();
    return result.data || [];
  },

  createLeaveRequest: async (leaveData: any): Promise<LeaveRequest> => {
    const response = await fetch('/api/leave-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create leave request');
    }
    const result = await response.json();
    return result.data;
  },

  // Admin Leave Requests
  fetchAdminLeaveRequests: async (filters?: any): Promise<LeaveRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.leaveType) params.append('leaveType', filters.leaveType);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);

    const response = await fetch(`/api/admin/leave-requests?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch leave requests');
    const result = await response.json();
    return result.data || [];
  },

  updateLeaveRequest: async (id: string, data: any): Promise<LeaveRequest> => {
    const response = await fetch(`/api/admin/leave-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to update leave request');
    }
    const result = await response.json();
    return result.data;
  },

  // Attendance
  fetchAttendanceStatus: async (): Promise<any> => {
    const response = await fetch('/api/attendance');
    if (!response.ok) throw new Error('Failed to fetch attendance status');
    const result = await response.json();
    return result.data;
  },

  clockInOut: async (): Promise<any> => {
    const response = await fetch('/api/attendance', { method: 'POST' });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to clock in/out');
    }
    return response.json();
  },

  fetchAttendanceStats: async (): Promise<any> => {
    const response = await fetch('/api/attendance/stats');
    if (!response.ok) throw new Error('Failed to fetch attendance stats');
    const result = await response.json();
    return result.data;
  },

  // Admin Attendance
  fetchAdminAttendanceStats: async (): Promise<any> => {
    const response = await fetch('/api/admin/attendance/stats');
    if (!response.ok) throw new Error('Failed to fetch admin attendance stats');
    const result = await response.json();
    return result.data;
  },

  fetchAdminAttendance: async (filters?: any, page = 1, limit = 10): Promise<any> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status: filters?.status || 'all',
    });

    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`/api/admin/attendance?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch attendance records');
    const result = await response.json();
    return result.data;
  },

  updateAttendance: async (id: string, data: any): Promise<AttendanceRecord> => {
    const response = await fetch(`/api/admin/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to update attendance');
    }
    const result = await response.json();
    return result.data;
  },

  deleteAttendance: async (id: string): Promise<void> => {
    const response = await fetch(`/api/admin/attendance/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to delete attendance');
    }
  },
};

// Common hooks
export const useUsers = () => {
  return useQuery({
    queryKey: HR_QUERY_KEYS.users,
    queryFn: hrApi.fetchUsers,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmployees = () => {
  return useQuery({
    queryKey: HR_QUERY_KEYS.employees,
    queryFn: hrApi.fetchUsers, // Same as users but with different key for caching
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLeaveRequests = () => {
  return useQuery({
    queryKey: HR_QUERY_KEYS.leaveRequests,
    queryFn: hrApi.fetchLeaveRequests,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminLeaveRequests = (filters?: any) => {
  return useQuery({
    queryKey: HR_QUERY_KEYS.adminLeaveRequests(filters),
    queryFn: () => hrApi.fetchAdminLeaveRequests(filters),
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAttendanceStatus = () => {
  return useQuery({
    queryKey: HR_QUERY_KEYS.attendanceStatus,
    queryFn: hrApi.fetchAttendanceStatus,
    retry: 2,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useAttendanceStats = () => {
  return useQuery({
    queryKey: HR_QUERY_KEYS.attendanceStats,
    queryFn: hrApi.fetchAttendanceStats,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useAdminAttendanceStats = () => {
  return useQuery({
    queryKey: HR_QUERY_KEYS.adminAttendanceStats,
    queryFn: hrApi.fetchAdminAttendanceStats,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminAttendance = (filters?: any, page = 1, limit = 10) => {
  return useQuery({
    queryKey: HR_QUERY_KEYS.adminAttendance(filters, page, limit),
    queryFn: () => hrApi.fetchAdminAttendance(filters, page, limit),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hrApi.createUser,
    onSuccess: (data) => {
      toast.success('کاربر با موفقیت ایجاد شد', {
        description: `کاربر ${data.firstName} ${data.lastName} با نقش ${data.roles} ایجاد شد`,
      });
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.users });
    },
    onError: (error: Error) => {
      toast.error('خطا در ایجاد کاربر', { description: error.message });
    },
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hrApi.createLeaveRequest,
    onSuccess: () => {
      toast.success('درخواست مرخصی با موفقیت ارسال شد', {
        description: 'درخواست شما در انتظار تایید مدیر است',
      });
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.leaveRequests });
    },
    onError: (error: Error) => {
      toast.error('خطا در ارسال درخواست مرخصی', { description: error.message });
    },
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateLeaveRequest(id, data),
    onSuccess: (data, variables) => {
      const action = variables.data.status === 'APPROVED' ? 'تایید شد' : 'رد شد';
      toast.success(`درخواست مرخصی ${action}`, {
        description: `درخواست ${data.user.firstName} ${data.user.lastName} ${action}`,
      });
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.adminLeaveRequests() });
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.leaveRequests });
    },
    onError: (error: Error) => {
      toast.error('خطا در به‌روزرسانی درخواست مرخصی', { description: error.message });
    },
  });
};

export const useClockInOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hrApi.clockInOut,
    onSuccess: (data) => {
      const action = data.action === 'clock-in' ? 'ورود' : 'خروج';
      toast.success(`ثبت ${action} با موفقیت انجام شد`, {
        description: `زمان: ${new Date().toLocaleTimeString('fa-IR')}`,
      });
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.attendanceStatus });
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.attendanceStats });
    },
    onError: () => {
      toast.error('خطا در ثبت حضور. لطفاً دوباره تلاش کنید.');
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateAttendance(id, data),
    onSuccess: () => {
      toast.success('رکورد حضور با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.adminAttendance() });
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.adminAttendanceStats });
    },
    onError: (error: Error) => {
      toast.error('خطا در به‌روزرسانی رکورد حضور', { description: error.message });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hrApi.deleteAttendance,
    onSuccess: () => {
      toast.success('رکورد حضور با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.adminAttendance() });
      queryClient.invalidateQueries({ queryKey: HR_QUERY_KEYS.adminAttendanceStats });
    },
    onError: () => {
      toast.error('خطا در حذف رکورد حضور');
    },
  });
};
