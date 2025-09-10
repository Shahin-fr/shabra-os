'use client';

import { motion } from 'framer-motion';
import { FolderOpen, CheckCircle, AlertTriangle, Clock, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const projectData = [
  {
    id: 1,
    name: 'وب‌سایت جدید',
    team: 'توسعه',
    progress: 85,
    status: 'on_track',
    deadline: '2024-02-15',
    teamSize: 5,
    completedTasks: 17,
    totalTasks: 20,
    priority: 'high'
  },
  {
    id: 2,
    name: 'اپلیکیشن موبایل',
    team: 'موبایل',
    progress: 60,
    status: 'delayed',
    deadline: '2024-03-01',
    teamSize: 3,
    completedTasks: 12,
    totalTasks: 20,
    priority: 'high'
  },
  {
    id: 3,
    name: 'سیستم CRM',
    team: 'توسعه',
    progress: 95,
    status: 'on_track',
    deadline: '2024-01-30',
    teamSize: 4,
    completedTasks: 19,
    totalTasks: 20,
    priority: 'medium'
  },
  {
    id: 4,
    name: 'پورتال مشتریان',
    team: 'طراحی',
    progress: 45,
    status: 'at_risk',
    deadline: '2024-04-15',
    teamSize: 2,
    completedTasks: 9,
    totalTasks: 20,
    priority: 'low'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'on_track':
      return 'text-green-500 bg-green-500/20';
    case 'delayed':
      return 'text-red-500 bg-red-500/20';
    case 'at_risk':
      return 'text-[#ff0a54] bg-[#ff0a54]/20';
    default:
      return 'text-gray-500 bg-gray-500/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'on_track':
      return <CheckCircle className="h-4 w-4" />;
    case 'delayed':
      return <AlertTriangle className="h-4 w-4" />;
    case 'at_risk':
      return <Clock className="h-4 w-4" />;
    default:
      return <FolderOpen className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function ProjectHealthOverview() {
  const totalProjects = projectData.length;
  const onTrackProjects = projectData.filter(p => p.status === 'on_track').length;
  const delayedProjects = projectData.filter(p => p.status === 'delayed').length;
  const avgProgress = Math.round(projectData.reduce((sum, p) => sum + p.progress, 0) / totalProjects);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-[#ff0a54]" />
            </div>
            وضعیت پروژه‌ها
            <Badge variant="outline" className="ml-auto">
              {onTrackProjects}/{totalProjects} طبق برنامه
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="grid grid-cols-3 gap-4 mb-6"
          >
            <div className="text-center p-3 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-foreground">{avgProgress}%</div>
              <div className="text-sm text-muted-foreground">میانگین پیشرفت</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-green-500">{onTrackProjects}</div>
              <div className="text-sm text-muted-foreground">طبق برنامه</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-red-500">{delayedProjects}</div>
              <div className="text-sm text-muted-foreground">تأخیر</div>
            </div>
          </motion.div>

          {/* Project List */}
          <div className="space-y-4">
            {projectData.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${getStatusColor(project.status)} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {getStatusIcon(project.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-[#ff0a54] transition-colors">
                        {project.name}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {project.team} • {project.teamSize} نفر
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {project.progress}%
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(project.priority)}`}
                    >
                      {project.priority === 'high' ? 'بالا' : project.priority === 'medium' ? 'متوسط' : 'پایین'}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">پیشرفت پروژه</span>
                    <span className="font-medium text-foreground">
                      {project.completedTasks}/{project.totalTasks} تسک
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full ${
                        project.status === 'on_track' ? 'bg-green-500' :
                        project.status === 'delayed' ? 'bg-red-500' :
                        project.status === 'at_risk' ? 'bg-[#ff0a54]' : 'bg-gray-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 1.0 + index * 0.1 }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      مهلت: {new Date(project.deadline).toLocaleDateString('fa-IR')}
                    </span>
                    <span className={`${
                      project.status === 'delayed' ? 'text-red-500' :
                      project.status === 'at_risk' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {project.status === 'on_track' ? 'طبق برنامه' :
                       project.status === 'delayed' ? 'تأخیر' : 'در خطر'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <Button 
              variant="outline" 
              className="w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              مدیریت پروژه‌ها
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
