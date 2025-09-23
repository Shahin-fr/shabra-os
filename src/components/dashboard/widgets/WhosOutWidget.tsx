'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, Clock, User } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EmployeeOnLeave {
  id: string;
  name: string;
  avatar?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
}

interface WhosOutWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function WhosOutWidget({ className, variant = 'desktop' }: WhosOutWidgetProps) {
  const { data: employeesOnLeave, isLoading, error } = useQuery({
    queryKey: ['team-status', 'whos-out'],
    queryFn: async (): Promise<EmployeeOnLeave[]> => {
      const response = await fetch('/api/team-status/whos-out');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to fetch who is out');
      }
      
      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const getLeaveTypeText = (leaveType: string) => {
    switch (leaveType) {
      case 'ANNUAL':
        return 'مرخصی سالانه';
      case 'SICK':
        return 'مرخصی استعلاجی';
      case 'PERSONAL':
        return 'مرخصی شخصی';
      case 'MATERNITY':
        return 'مرخصی زایمان';
      case 'PATERNITY':
        return 'مرخصی پدری';
      case 'EMERGENCY':
        return 'مرخصی اضطراری';
      default:
        return 'مرخصی';
    }
  };

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case 'ANNUAL':
        return 'bg-blue-100 text-blue-700';
      case 'SICK':
        return 'bg-red-100 text-red-700';
      case 'PERSONAL':
        return 'bg-green-100 text-green-700';
      case 'MATERNITY':
        return 'bg-pink-100 text-pink-700';
      case 'PATERNITY':
        return 'bg-purple-100 text-purple-700';
      case 'EMERGENCY':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays === 1) {
      return 'امروز';
    } else if (diffDays === 2) {
      return '۲ روز';
    } else {
      return `${diffDays} روز`;
    }
  };

  const isMobile = variant === 'mobile';
  
  // Safety check to ensure employeesOnLeave is always an array
  const safeEmployeesOnLeave = Array.isArray(employeesOnLeave) ? employeesOnLeave : [];

  return (
    <WidgetCard
      title="کسی نیست امروز"
      className={cn(
        'bg-gradient-to-br from-teal-50 to-cyan-50',
        className
      )}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && safeEmployeesOnLeave.length === 0}
      emptyMessage="همه در محل کار هستند"
      emptyIcon={<Users className="h-8 w-8 text-teal-400" />}
    >
      {/* Summary */}
      {safeEmployeesOnLeave.length > 0 && (
        <div className="mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 font-vazirmatn">
              {safeEmployeesOnLeave.length}
            </div>
            <div className="text-sm text-gray-600 font-vazirmatn">
              نفر در مرخصی
            </div>
          </div>
        </div>
      )}

      {/* Employees List */}
      <div className="space-y-3">
        {safeEmployeesOnLeave.slice(0, isMobile ? 3 : 5).map((employee) => (
          <div
            key={employee.id}
            className="p-3 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {employee.avatar ? (
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Employee Info */}
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'font-vazirmatn font-medium text-gray-900 leading-tight',
                  isMobile ? 'text-sm' : 'text-base'
                )}>
                  {employee.name}
                </h4>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-vazirmatn font-medium',
                    getLeaveTypeColor(employee.leaveType)
                  )}>
                    {getLeaveTypeText(employee.leaveType)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="font-vazirmatn">
                      {formatDate(employee.startDate)} - {formatDate(employee.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-vazirmatn">
                      {getDuration(employee.startDate, employee.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {safeEmployeesOnLeave.length > 0 && (
        <div className="pt-4 border-t border-white/40">
          <Button
            variant="outline"
            className="w-full font-vazirmatn text-sm"
            onClick={() => {
              // Navigate to team status page
              window.location.href = '/team-status';
            }}
          >
            مشاهده وضعیت تیم
          </Button>
        </div>
      )}
    </WidgetCard>
  );
}
