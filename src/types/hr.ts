// HR Module Shared Types
// This file contains all shared TypeScript interfaces and types for the HR module

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  user: Employee;
  checkIn: string;
  checkOut: string | null;
  totalDuration: string | null;
  status: 'completed' | 'in-progress';
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStatus {
  isClockedIn: boolean;
  status: 'not-started' | 'active' | 'completed' | 'on-break';
  currentAttendance?: {
    checkIn: string;
    checkOut?: string;
  };
  currentTime: string;
}

export interface AttendanceStats {
  today: {
    totalHours: number;
    averageHours: number;
    workingDays: number;
    recordCount: number;
    records: AttendanceRecord[];
  };
  week: {
    totalHours: number;
    averageHours: number;
    workingDays: number;
    recordCount: number;
  };
  month: {
    totalHours: number;
    averageHours: number;
    workingDays: number;
    recordCount: number;
  };
  year: {
    totalHours: number;
    averageHours: number;
    workingDays: number;
    recordCount: number;
  };
}

export interface AdminAttendanceStats {
  today: {
    totalEmployeesPresent: number;
    totalHoursLogged: number;
    averageClockInTime: string;
    currentlyClockedIn: number;
    attendanceRate: number;
  };
  week: {
    totalHoursLogged: number;
    totalRecords: number;
  };
  overall: {
    totalEmployees: number;
    activeEmployees: number;
  };
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: Employee;
  reviewer?: Employee;
}

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  thisWeek: number;
}

export type LeaveType = 'ANNUAL' | 'SICK' | 'UNPAID' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'OTHER';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

// Constants
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: 'مرخصی سالانه',
  SICK: 'مرخصی استعلاجی',
  UNPAID: 'مرخصی بدون حقوق',
  EMERGENCY: 'مرخصی اضطراری',
  MATERNITY: 'مرخصی زایمان',
  PATERNITY: 'مرخصی پدری',
  STUDY: 'مرخصی تحصیلی',
  OTHER: 'سایر',
};

export const LEAVE_TYPE_OPTIONS = [
  { value: 'ANNUAL' as const, label: 'مرخصی سالانه', description: 'مرخصی استحقاقی سالانه' },
  { value: 'SICK' as const, label: 'مرخصی استعلاجی', description: 'در صورت بیماری' },
  { value: 'UNPAID' as const, label: 'مرخصی بدون حقوق', description: 'مرخصی بدون دریافت حقوق' },
  { value: 'EMERGENCY' as const, label: 'مرخصی اضطراری', description: 'در موارد اضطراری' },
  { value: 'MATERNITY' as const, label: 'مرخصی زایمان', description: 'مرخصی زایمان' },
  { value: 'PATERNITY' as const, label: 'مرخصی پدری', description: 'مرخصی پدری' },
  { value: 'STUDY' as const, label: 'مرخصی تحصیلی', description: 'برای امور تحصیلی' },
  { value: 'OTHER' as const, label: 'سایر', description: 'سایر موارد' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'مدیر کل',
  MANAGER: 'مدیر',
  EMPLOYEE: 'کارمند',
};

export const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  MANAGER: 'bg-orange-100 text-orange-800 border-orange-200',
  EMPLOYEE: 'bg-blue-100 text-blue-800 border-blue-200',
};

// Utility functions
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const getStatusBadge = (status: LeaveStatus): { variant: string; label: string; className: string } => {
  switch (status) {
    case 'PENDING':
      return {
        variant: 'secondary',
        label: 'در انتظار',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      };
    case 'APPROVED':
      return {
        variant: 'default',
        label: 'تایید شده',
        className: 'bg-green-100 text-green-800 border-green-200',
      };
    case 'REJECTED':
      return {
        variant: 'destructive',
        label: 'رد شده',
        className: 'bg-red-100 text-red-800 border-red-200',
      };
    case 'CANCELLED':
      return {
        variant: 'outline',
        label: 'لغو شده',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      };
    default:
      return {
        variant: 'secondary',
        label: 'نامشخص',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      };
  }
};
