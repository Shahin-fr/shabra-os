'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Pin, 
  Calendar,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { CreateAnnouncementModal } from '@/components/admin/announcements/CreateAnnouncementModal';
import { EditAnnouncementModal } from '@/components/admin/announcements/EditAnnouncementModal';
import { DeleteAnnouncementModal } from '@/components/admin/announcements/DeleteAnnouncementModal';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface AnnouncementsResponse {
  success: boolean;
  data: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminAnnouncementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isPinnedFilter, setIsPinnedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const queryClient = useQueryClient();

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch announcements
  const {
    data: announcementsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-announcements', debouncedSearchTerm, categoryFilter, isPinnedFilter, page],
    queryFn: async (): Promise<AnnouncementsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
        ...(isPinnedFilter && isPinnedFilter !== 'all' && { isPinned: isPinnedFilter }),
      });

      const response = await fetch(`/api/admin/announcements?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      return response.json();
    },
    retry: 2,
    staleTime: 1 * 60 * 1000, // 1 minute - admin data should be more fresh
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: true, // Refetch on window focus for admin data
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete announcement');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('اعلان با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setDeleteModalOpen(false);
      setSelectedAnnouncement(null);
    },
    onError: (error: Error) => {
      toast.error('خطا در حذف اعلان', {
        description: error.message,
      });
    },
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      GENERAL: 'عمومی',
      TECHNICAL: 'فنی',
      EVENT: 'رویداد',
      IMPORTANT: 'مهم',
    };
    return labels[category] || category;
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'IMPORTANT':
        return 'destructive';
      case 'TECHNICAL':
        return 'default';
      case 'EVENT':
        return 'secondary';
      case 'GENERAL':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setEditModalOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAnnouncement) {
      deleteAnnouncementMutation.mutate(selectedAnnouncement.id);
    }
  };

  if (isLoading) {
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
              <p>در حال بارگذاری اعلان‌ها...</p>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              خطا در بارگذاری اعلان‌ها: {error.message}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => refetch()} variant="outline">
              تلاش مجدد
            </Button>
          </div>
        </OptimizedMotion>
      </div>
    );
  }

  const announcements = announcementsData?.data || [];
  const pagination = announcementsData?.pagination;

  return (
    <div className="container mx-auto px-4 py-8">
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">مدیریت اعلان‌ها</h1>
          <p className="text-gray-600">
            ایجاد و مدیریت اعلان‌های داخلی
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="جستجو در عنوان یا محتوا..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="فیلتر بر اساس دسته" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دسته‌ها</SelectItem>
                  <SelectItem value="GENERAL">عمومی</SelectItem>
                  <SelectItem value="TECHNICAL">فنی</SelectItem>
                  <SelectItem value="EVENT">رویداد</SelectItem>
                  <SelectItem value="IMPORTANT">مهم</SelectItem>
                </SelectContent>
              </Select>

              <Select value={isPinnedFilter} onValueChange={setIsPinnedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="true">سنجاق شده</SelectItem>
                  <SelectItem value="false">عادی</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
                بروزرسانی
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Button */}
        <div className="mb-6">
          <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            ایجاد اعلان جدید
          </Button>
        </div>

        {/* Announcements Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              لیست اعلان‌ها ({pagination?.total || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>عنوان</TableHead>
                        <TableHead>دسته</TableHead>
                        <TableHead>نویسنده</TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {announcements.map((announcement, index) => (
                        <OptimizedMotion
                          key={announcement.id}
                          as="tr"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {announcement.isPinned && (
                                  <Pin className="h-4 w-4 text-yellow-500" />
                                )}
                                <div>
                                  <div className="font-medium line-clamp-1">
                                    {announcement.title}
                                  </div>
                                  <div className="text-sm text-gray-600 line-clamp-2">
                                    {announcement.content}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getCategoryBadgeVariant(announcement.category)}>
                                {getCategoryLabel(announcement.category)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                  {announcement.author.avatar ? (
                                    <img
                                      src={announcement.author.avatar}
                                      alt={`${announcement.author.firstName} ${announcement.author.lastName}`}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    `${announcement.author.firstName.charAt(0)}${announcement.author.lastName.charAt(0)}`
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {announcement.author.firstName} {announcement.author.lastName}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {announcement.author.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {formatDate(announcement.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {announcement.isPinned ? (
                                <Badge variant="outline" className="text-yellow-600">
                                  <Pin className="h-3 w-3 ml-1" />
                                  سنجاق شده
                                </Badge>
                              ) : (
                                <Badge variant="secondary">عادی</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Filter className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                                    <Edit className="h-4 w-4 ml-2" />
                                    ویرایش
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(announcement)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                        </OptimizedMotion>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {announcements.map((announcement, index) => (
                    <OptimizedMotion
                      key={announcement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {announcement.isPinned && (
                                <Pin className="h-4 w-4 text-yellow-500" />
                              )}
                              <h3 className="font-medium">{announcement.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {announcement.content}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={getCategoryBadgeVariant(announcement.category)}>
                                {getCategoryLabel(announcement.category)}
                              </Badge>
                              {announcement.isPinned && (
                                <Badge variant="outline" className="text-yellow-600">
                                  سنجاق شده
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {announcement.author.firstName} {announcement.author.lastName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(announcement.createdAt)}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 ml-2" />
                            ویرایش
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(announcement)}
                            className="flex-1 text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </Button>
                        </div>
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>هیچ اعلانی یافت نشد</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <CreateAnnouncementModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setCreateModalOpen(false);
          }}
        />

        <EditAnnouncementModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          announcement={selectedAnnouncement}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setEditModalOpen(false);
            setSelectedAnnouncement(null);
          }}
        />

        <DeleteAnnouncementModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          announcement={selectedAnnouncement}
          onConfirm={handleConfirmDelete}
          isLoading={deleteAnnouncementMutation.isPending}
        />
      </OptimizedMotion>
    </div>
  );
}
