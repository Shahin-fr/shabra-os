'use client';

import { useState } from 'react';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CapacityForecastData {
  date: string;
  totalTeamMembers: number;
  onLeave: number;
  availableHeadcount: number;
  isAtRisk: boolean;
}

interface CapacityForecastWidgetProps {
  data: CapacityForecastData[];
  currentMonth: Date;
}

export function CapacityForecastWidget({ data, currentMonth }: CapacityForecastWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Filter data for current month
  const monthData = data.filter(day => {
    const dayDate = new Date(day.date);
    return dayDate.getMonth() === currentMonth.getMonth() && 
           dayDate.getFullYear() === currentMonth.getFullYear();
  });

  // Calculate statistics
  const stats = {
    totalDays: monthData.length,
    atRiskDays: monthData.filter(day => day.isAtRisk).length,
    averageAvailability: monthData.length > 0 
      ? Math.round(monthData.reduce((sum, day) => sum + (day.availableHeadcount / day.totalTeamMembers), 0) / monthData.length * 100)
      : 0,
    minAvailability: monthData.length > 0 
      ? Math.min(...monthData.map(day => Math.round((day.availableHeadcount / day.totalTeamMembers) * 100)))
      : 0,
    maxAvailability: monthData.length > 0 
      ? Math.max(...monthData.map(day => Math.round((day.availableHeadcount / day.totalTeamMembers) * 100)))
      : 0,
  };

  // Get trend for the month
  const getTrend = () => {
    if (monthData.length < 7) return 'stable';
    
    const firstWeek = monthData.slice(0, 7);
    const lastWeek = monthData.slice(-7);
    
    const firstWeekAvg = firstWeek.reduce((sum, day) => sum + (day.availableHeadcount / day.totalTeamMembers), 0) / firstWeek.length;
    const lastWeekAvg = lastWeek.reduce((sum, day) => sum + (day.availableHeadcount / day.totalTeamMembers), 0) / lastWeek.length;
    
    if (lastWeekAvg > firstWeekAvg + 0.1) return 'up';
    if (lastWeekAvg < firstWeekAvg - 0.1) return 'down';
    return 'stable';
  };

  const trend = getTrend();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fa-IR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAvailabilityBadgeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#ff0a54]" />
              خلاصه ظرفیت ماه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.averageAvailability}%
                </div>
                <div className="text-sm text-gray-600">میانگین دسترسی</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.atRiskDays}
                </div>
                <div className="text-sm text-gray-600">روزهای پرخطر</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.maxAvailability}%
                </div>
                <div className="text-sm text-gray-600">بیشترین دسترسی</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.minAvailability}%
                </div>
                <div className="text-sm text-gray-600">کمترین دسترسی</div>
              </div>
            </div>

            {/* Trend Indicator */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600">روند ماه:</span>
              {trend === 'up' && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">در حال بهبود</span>
                </div>
              )}
              {trend === 'down' && (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">در حال کاهش</span>
                </div>
              )}
              {trend === 'stable' && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Minus className="h-4 w-4" />
                  <span className="text-sm font-medium">پایدار</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* At-Risk Days Alert */}
      {stats.atRiskDays > 0 && (
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>هشدار ظرفیت:</strong> {stats.atRiskDays} روز در این ماه دارای دسترسی کمتر از ۵۰٪ هستند. 
              لطفاً برنامه‌ریزی خود را بررسی کنید.
            </AlertDescription>
          </Alert>
        </OptimizedMotion>
      )}

      {/* Daily Capacity Grid */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ظرفیت روزانه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {monthData.map((day) => {
                const percentage = Math.round((day.availableHeadcount / day.totalTeamMembers) * 100);
                const isSelected = selectedDate === day.date;
                
                return (
                  <Button
                    key={day.date}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`h-16 flex flex-col items-center justify-center p-2 ${
                      day.isAtRisk ? 'border-red-300 bg-red-50' : ''
                    }`}
                    onClick={() => setSelectedDate(isSelected ? null : day.date)}
                  >
                    <div className="text-xs font-medium">
                      {formatDate(day.date)}
                    </div>
                    <div className={`text-xs ${getAvailabilityColor(percentage)}`}>
                      {percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.availableHeadcount}/{day.totalTeamMembers}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Selected Day Details */}
      {selectedDate && (
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                جزئیات {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const dayData = monthData.find(day => day.date === selectedDate);
                if (!dayData) return null;

                const percentage = Math.round((dayData.availableHeadcount / dayData.totalTeamMembers) * 100);
                
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">کل اعضای تیم:</span>
                      <span className="font-medium">{dayData.totalTeamMembers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">در مرخصی:</span>
                      <span className="font-medium text-orange-600">{dayData.onLeave}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">دسترسی:</span>
                      <Badge className={getAvailabilityBadgeColor(percentage)}>
                        {percentage}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">وضعیت:</span>
                      <Badge className={dayData.isAtRisk ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {dayData.isAtRisk ? 'پرخطر' : 'عادی'}
                      </Badge>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </OptimizedMotion>
      )}
    </div>
  );
}
