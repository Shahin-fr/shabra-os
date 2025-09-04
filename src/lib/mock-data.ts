// Mock data for development and testing purposes
// In production, this should be replaced with actual API calls

export const mockTasks = [
  {
    id: 1,
    title: 'طراحی لوگوی جدید',
    completed: false,
    priority: 'high',
  },
  {
    id: 2,
    title: 'آماده‌سازی محتوای هفته آینده',
    completed: false,
    priority: 'medium',
  },
  {
    id: 3,
    title: 'بررسی گزارش‌های ماهانه',
    completed: true,
    priority: 'low',
  },
  {
    id: 4,
    title: 'به‌روزرسانی استوری‌های اینستاگرام',
    completed: false,
    priority: 'high',
  },
  {
    id: 5,
    title: 'جلسه تیم هفتگی',
    completed: false,
    priority: 'medium',
  },
];

export const mockTeamMembers = [
  {
    id: 1,
    name: 'شاهین',
    email: 'shahin@shabra.com',
    avatar: '/api/placeholder/32/32',
    status: 'online',
  },
  {
    id: 2,
    name: 'سارا',
    email: 'sara@shabra.com',
    avatar: '/api/placeholder/32/32',
    status: 'online',
  },
  {
    id: 3,
    name: 'علی',
    email: 'ali@shabra.com',
    avatar: '/api/placeholder/32/32',
    status: 'away',
  },
  {
    id: 4,
    name: 'فاطمه',
    email: 'fateme@shabra.com',
    avatar: '/api/placeholder/32/32',
    status: 'online',
  },
  {
    id: 5,
    name: 'محمد',
    email: 'mohammad@shabra.com',
    avatar: '/api/placeholder/32/32',
    status: 'offline',
  },
  {
    id: 6,
    name: 'زهرا',
    email: 'zahra@shabra.com',
    avatar: '/api/placeholder/32/32',
    status: 'online',
  },
];

export const mockActivities = [
  {
    id: 1,
    message: "پروژه 'توسعه وب سایت' به‌روزرسانی شد",
    time: '2 دقیقه پیش',
    type: 'project',
  },
  {
    id: 2,
    message: 'وظیفه جدیدی به شما محول شد',
    time: '15 دقیقه پیش',
    type: 'task',
  },
  {
    id: 3,
    message: 'استوری جدید در استوری‌بورد ایجاد شد',
    time: '1 ساعت پیش',
    type: 'story',
  },
  {
    id: 4,
    message: 'گزارش تحلیل ماهانه آماده شد',
    time: '2 ساعت پیش',
    type: 'analytics',
  },
  {
    id: 5,
    message: 'عضو جدید به تیم اضافه شد',
    time: '3 ساعت پیش',
    type: 'team',
  },
];

export const mockLatestTask = {
  id: 1,
  title: 'طراحی لوگوی جدید',
  completed: false,
  priority: 'high',
};

export const mockCompactTeamMembers = [
  {
    id: 1,
    name: 'شاهین',
    status: 'online',
  },
  {
    id: 2,
    name: 'سارا',
    status: 'online',
  },
  {
    id: 3,
    name: 'علی',
    status: 'away',
  },
  {
    id: 4,
    name: 'فاطمه',
    status: 'online',
  },
];
