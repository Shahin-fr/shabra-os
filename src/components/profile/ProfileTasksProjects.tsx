'use client';

import { useState } from 'react';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  Calendar, 
  Search,
  MoreHorizontal
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { CompleteProfileData } from '@/types/profile';

interface ProfileTasksProjectsProps {
  profileData: CompleteProfileData;
}

export function ProfileTasksProjects({ profileData }: ProfileTasksProjectsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'PAUSED':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      case 'Todo':
        return 'outline';
      case 'InProgress':
        return 'default';
      case 'Done':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'فعال';
      case 'COMPLETED':
        return 'تکمیل شده';
      case 'PAUSED':
        return 'متوقف';
      case 'CANCELLED':
        return 'لغو شده';
      case 'Todo':
        return 'انجام نشده';
      case 'InProgress':
        return 'در حال انجام';
      case 'Done':
        return 'انجام شده';
      default:
        return status;
    }
  };

  // Filter tasks
  const filteredTasks = profileData.recentTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesProject = projectFilter === 'all' || task.project?.id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Filter projects
  const filteredProjects = profileData.projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Projects Section */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              پروژه‌ها ({profileData.projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-lg">{project.name}</h3>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {project.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          شروع: {formatDate(project.startDate)}
                        </div>
                      )}
                      {project.endDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          پایان: {formatDate(project.endDate)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>هیچ پروژه‌ای یافت نشد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Tasks Section */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                تسک‌ها ({profileData.recentTasks.length})
              </CardTitle>
              
              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="جستجو در تسک‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-10 w-64"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="Todo">انجام نشده</SelectItem>
                    <SelectItem value="InProgress">در حال انجام</SelectItem>
                    <SelectItem value="Done">انجام شده</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="پروژه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه پروژه‌ها</SelectItem>
                    {profileData.projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {getStatusLabel(task.status)}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {task.project && (
                          <div className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {task.project.name}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            موعد: {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>مشاهده جزئیات</DropdownMenuItem>
                        <DropdownMenuItem>ویرایش</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>هیچ تسکی یافت نشد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Task Statistics */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              آمار تسک‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {profileData.performance.taskCounts.Todo}
                </div>
                <div className="text-sm text-gray-600">انجام نشده</div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {profileData.performance.taskCounts.InProgress}
                </div>
                <div className="text-sm text-gray-600">در حال انجام</div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {profileData.performance.taskCounts.Done}
                </div>
                <div className="text-sm text-gray-600">انجام شده</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>
    </div>
  );
}
