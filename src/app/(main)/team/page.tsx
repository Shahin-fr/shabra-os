'use client';

import { useQuery } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Mail, 
  Building,
  CheckSquare,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useState } from 'react';

import { TeamProfile } from '@/types/profile';

export default function TeamPage() {
  const { isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Fetch team profiles
  const {
    data: profilesData,
    isLoading,
    error,
    refetch,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ['profiles', searchTerm, departmentFilter, page],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(searchTerm && { search: searchTerm }),
          ...(departmentFilter && departmentFilter !== 'all' && { department: departmentFilter }),
        });

        console.log('Fetching profiles with params:', params.toString());
        const response = await fetch(`/api/profiles?${params}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch profiles`);
        }
        
        const result = await response.json();
        console.log('Profiles API response:', result);
        
        // Validate response structure
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid response format from server');
        }
        
        if (!result.success) {
          throw new Error(result.error || 'Server returned error status');
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - team data changes less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    enabled: !authLoading, // Only run query when auth is not loading
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'MANAGER':
        return 'default';
      case 'EMPLOYEE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'مدیر سیستم';
      case 'MANAGER':
        return 'مدیر';
      case 'EMPLOYEE':
        return 'کارمند';
      default:
        return role;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>در حال بارگذاری لیست تیم...</p>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
              <p className="text-red-600 mb-4">
                خطا در بارگذاری لیست تیم: {error instanceof Error ? error.message : 'خطای نامشخص'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                تلاش مجدد
              </Button>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </div>
    );
  }

  const profiles: TeamProfile[] = profilesData?.data || [];
  const pagination = profilesData?.pagination || { total: 0, pages: 1, page: 1, limit: 10 };

  return (
    <div className="container mx-auto px-4 py-8">
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">تیم</h1>
          <p className="text-gray-600">
            مدیریت و مشاهده اطلاعات اعضای تیم
        </p>
      </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row rtl:flex-row-reverse gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="جستجو در نام، ایمیل یا بخش..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pe-10"
                  />
                </div>
              </div>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48 w-full justify-end text-right">
                  <SelectValue placeholder="فیلتر بر اساس بخش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه بخش‌ها</SelectItem>
                  <SelectItem value="توسعه">توسعه</SelectItem>
                  <SelectItem value="طراحی">طراحی</SelectItem>
                  <SelectItem value="بازاریابی">بازاریابی</SelectItem>
                  <SelectItem value="فروش">فروش</SelectItem>
                  <SelectItem value="پشتیبانی">پشتیبانی</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ms-2 ${isLoading ? 'animate-spin' : ''}`} />
                بروزرسانی
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              اعضای تیم ({pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
            {isSuccess && profiles.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>عضو</TableHead>
                        <TableHead>نقش</TableHead>
                        <TableHead>بخش</TableHead>
                        <TableHead>تسک‌ها</TableHead>
                        <TableHead>عملکرد</TableHead>
                        <TableHead>زیردستان</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile, index) => (
                        <OptimizedMotion
                          key={profile.id}
                          as="tr"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                  {profile.avatar ? (
                                    <img
                                      src={profile.avatar}
                                      alt={`${profile.firstName} ${profile.lastName}`}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
                                  )}
              </div>
                                <div>
                                  <div className="font-medium">
                                    {profile.firstName} {profile.lastName}
            </div>
                                  <div className="text-sm text-gray-600 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {profile.email}
                      </div>
                    </div>
                  </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(profile.roles)}>
                                {getRoleLabel(profile.roles)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3 text-gray-400" />
                                {profile.profile?.department || 'تعریف نشده'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center gap-1 mb-1">
                                  <CheckSquare className="h-3 w-3 text-green-600" />
                                  {profile.taskStats?.Done || 0} انجام شده
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-yellow-600" />
                                  {profile.taskStats?.InProgress || 0} در حال انجام
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {profile.taskCount} تسک کل
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-gray-400" />
                                {profile.subordinateCount}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link href={`/profile/${profile.id}`}>
                                <Button variant="outline" size="sm">
                                  مشاهده پروفایل
                                </Button>
                              </Link>
                            </TableCell>
                        </OptimizedMotion>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {profiles.map((profile, index) => (
                    <OptimizedMotion
                      key={profile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {profile.avatar ? (
                              <img
                                src={profile.avatar}
                                alt={`${profile.firstName} ${profile.lastName}`}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-lg">
                              {profile.firstName} {profile.lastName}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {profile.email}
                            </div>
                          </div>
                          <Badge variant={getRoleBadgeVariant(profile.roles)}>
                            {getRoleLabel(profile.roles)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-gray-400" />
                            {profile.profile?.department || 'تعریف نشده'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            {profile.subordinateCount} زیردست
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckSquare className="h-3 w-3 text-green-600" />
                            {profile.taskStats?.Done || 0} انجام شده
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-yellow-600" />
                            {profile.taskStats?.InProgress || 0} در حال انجام
                          </div>
                        </div>

                        <Link href={`/profile/${profile.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            مشاهده پروفایل
                          </Button>
                        </Link>
                      </div>
                    </OptimizedMotion>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      قبلی
                    </Button>
                    <span className="text-sm text-gray-600">
                      صفحه {page} از {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.pages}
                    >
                      بعدی
                    </Button>
                  </div>
                )}
              </>
            ) : isSuccess && profiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {profilesData?.data?.length === 0 
                    ? 'هیچ عضوی یافت نشد'
                    : 'هیچ عضوی با فیلترهای انتخاب شده یافت نشد'
                  }
                </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
      </OptimizedMotion>
    </div>
  );
}