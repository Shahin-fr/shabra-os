'use client';

import { useState } from 'react';
import { Calendar, Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { SimpleMeetingCard } from './SimpleMeetingCard';
import { useOptimizedMeetings } from '@/hooks/useOptimizedMeetings';

interface SimpleMeetingsListProps {
  onCreateMeeting?: () => void;
  onViewMeeting?: (meetingId: string) => void;
  onEditMeeting?: (meetingId: string) => void;
  onDeleteMeeting?: (meetingId: string) => void;
  className?: string;
}

export function SimpleMeetingsList({
  onCreateMeeting,
  onViewMeeting,
  onEditMeeting,
  onDeleteMeeting,
  className
}: SimpleMeetingsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useOptimizedMeetings({
    limit: pageSize,
    offset: currentPage * pageSize,
    type: typeFilter !== 'all' ? typeFilter as 'ONE_ON_ONE' | 'TEAM_MEETING' : undefined,
  });

  // Filter meetings based on search term and status
  const filteredMeetings = data?.data.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.creator.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.creator.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    refetch();
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              خطا در بارگذاری جلسات
            </h3>
            <p className="text-gray-600 mb-4">
              متأسفانه در بارگذاری جلسات مشکلی پیش آمده است.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              تلاش مجدد
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#ff0a54] to-[#ff6b9d] rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">جلسات</h2>
            <p className="text-sm text-gray-600">
              {data?.pagination.total || 0} جلسه در مجموع
            </p>
          </div>
        </div>
        
        {onCreateMeeting && (
          <Button onClick={onCreateMeeting} className="bg-[#ff0a54] hover:bg-[#ff0a54]/90">
            <Plus className="h-4 w-4 me-2" />
            جلسه جدید
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="جستجو در جلسات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="SCHEDULED">برنامه‌ریزی شده</SelectItem>
                <SelectItem value="COMPLETED">تکمیل شده</SelectItem>
                <SelectItem value="CANCELLED">لغو شده</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="نوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه انواع</SelectItem>
                <SelectItem value="ONE_ON_ONE">جلسه دو نفره</SelectItem>
                <SelectItem value="TEAM_MEETING">جلسه تیمی</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <Filter className="h-4 w-4 me-2" />
              به‌روزرسانی
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Meetings List */}
      {!isLoading && (
        <>
          {filteredMeetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  هیچ جلسه‌ای یافت نشد
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'با فیلترهای انتخاب شده هیچ جلسه‌ای یافت نشد.'
                    : 'هنوز هیچ جلسه‌ای ایجاد نشده است.'}
                </p>
                {onCreateMeeting && (
                  <Button onClick={onCreateMeeting} className="bg-[#ff0a54] hover:bg-[#ff0a54]/90">
                    <Plus className="h-4 w-4 me-2" />
                    اولین جلسه را ایجاد کنید
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <SimpleMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onViewDetails={onViewMeeting}
                  onEdit={onEditMeeting}
                  onDelete={onDeleteMeeting}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {data?.pagination.hasMore && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleLoadMore} variant="outline" disabled={isLoading}>
                {isLoading ? 'در حال بارگذاری...' : 'بارگذاری بیشتر'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
