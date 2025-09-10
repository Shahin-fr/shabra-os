'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Clock, AlertTriangle, User, FileText, Calendar, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockInboxItems = [
  {
    id: 1,
    type: 'leave_request',
    title: 'درخواست مرخصی',
    employee: 'احمد محمدی',
    details: 'مرخصی شخصی - 3 روز',
    priority: 'high',
    time: '2 ساعت پیش',
    status: 'pending'
  },
  {
    id: 2,
    type: 'task_assignment',
    title: 'تخصیص تسک جدید',
    employee: 'فاطمه احمدی',
    details: 'طراحی UI برای پروژه جدید',
    priority: 'medium',
    time: '4 ساعت پیش',
    status: 'pending'
  },
  {
    id: 3,
    type: 'project_approval',
    title: 'تأیید پروژه',
    employee: 'علی رضایی',
    details: 'وب‌سایت جدید - 95% تکمیل',
    priority: 'low',
    time: '6 ساعت پیش',
    status: 'pending'
  },
  {
    id: 4,
    type: 'budget_request',
    title: 'درخواست بودجه',
    employee: 'مریم حسینی',
    details: 'خرید نرم‌افزار جدید - 2,500,000 تومان',
    priority: 'high',
    time: '1 روز پیش',
    status: 'pending'
  },
  {
    id: 5,
    type: 'equipment_request',
    title: 'درخواست تجهیزات',
    employee: 'حسن کریمی',
    details: 'لپ‌تاپ جدید برای تیم توسعه',
    priority: 'medium',
    time: '2 روز پیش',
    status: 'pending'
  },
  {
    id: 6,
    type: 'meeting_request',
    title: 'درخواست جلسه',
    employee: 'زهرا نوری',
    details: 'جلسه بررسی پروژه - فردا ساعت 10',
    priority: 'low',
    time: '3 روز پیش',
    status: 'pending'
  },
  {
    id: 7,
    type: 'training_request',
    title: 'درخواست آموزش',
    employee: 'محمد صادقی',
    details: 'دوره آموزشی React Advanced',
    priority: 'medium',
    time: '4 روز پیش',
    status: 'pending'
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'leave_request':
      return <Calendar className="h-4 w-4" />;
    case 'task_assignment':
      return <FileText className="h-4 w-4" />;
    case 'project_approval':
      return <CheckCircle className="h-4 w-4" />;
    case 'budget_request':
      return <AlertTriangle className="h-4 w-4" />;
    case 'equipment_request':
      return <User className="h-4 w-4" />;
    case 'meeting_request':
      return <Calendar className="h-4 w-4" />;
    case 'training_request':
      return <User className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
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

export function ActionableInbox() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (itemId: number) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="backdrop-blur-sm bg-white/5 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-[#ff0a54]" />
            </div>
            اقدامات فوری
            <Badge className="ml-auto bg-[#ff0a54] hover:bg-[#ff0a54]/90">
              {mockInboxItems.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockInboxItems.map((item, index) => {
            const isExpanded = expandedItems.includes(item.id);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                onClick={() => toggleExpanded(item.id)}
              >
                {/* Main Content - Always Visible */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-6 h-6 bg-[#ff0a54]/20 rounded-full flex items-center justify-center group-hover:bg-[#ff0a54]/30 transition-colors">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground group-hover:text-[#ff0a54] transition-colors text-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.employee}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Minimal Action Buttons */}
                    <Button
                      size="sm"
                      className="w-6 h-6 p-0 bg-green-500 hover:bg-green-600 text-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle approve
                      }}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-6 h-6 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle reject
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    {/* Expand/Collapse Icon */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Content - Hidden by Default */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 pt-3 border-t border-white/10"
                    >
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.details}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority === 'high' ? 'بالا' : item.priority === 'medium' ? 'متوسط' : 'پایین'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-4 border-t border-white/10"
          >
            <Button 
              variant="outline" 
              className="w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 text-sm"
            >
              مشاهده همه درخواست‌ها
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
