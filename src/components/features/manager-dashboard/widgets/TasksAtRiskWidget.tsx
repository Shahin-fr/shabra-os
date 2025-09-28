import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TasksAtRiskWidget = () => {
  const tasksAtRisk = [
    { id: 1, name: 'طراحی بنرهای تبلیغاتی', user: 'سارا حسینی', status: 'Overdue', dueDate: 'دیروز' },
    { id: 2, name: 'آماده‌سازی ارائه فروش', user: 'کیان مهرزاد', status: 'Due Soon', dueDate: 'فردا' },
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Overdue':
        return 'تأخیر';
      case 'Due Soon':
        return 'به زودی';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Overdue':
        return 'destructive';
      case 'Due Soon':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className="bg-card shadow-soft">
      <CardHeader>
        <CardTitle className="text-text-primary text-lg font-bold">
          وظایف در خطر
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Tasks List */}
        <div className="space-y-3">
          {tasksAtRisk.map((task) => (
            <div
              key={task.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="flex items-start rtl:items-start justify-between mb-2">
                <h4 className="font-semibold text-text-primary text-sm">
                  {task.name}
                </h4>
                <Badge variant={getStatusVariant(task.status) as any}>
                  {getStatusText(task.status)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm text-text-secondary">
                <span>مسئول: {task.user}</span>
                <span>موعد: {task.dueDate}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tasksAtRisk.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            <div className="text-4xl mb-2">✅</div>
            <p>هیچ وظیفه‌ای در خطر نیست</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksAtRiskWidget;
