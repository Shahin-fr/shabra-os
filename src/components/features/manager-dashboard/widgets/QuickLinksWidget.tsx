import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QuickLinksWidget = () => {
  const quickActions = [
    {
      id: 1,
      label: 'تخصیص وظیفه جدید',
      icon: '+',
      variant: 'default' as const,
      onClick: () => {
        console.log('New task assignment clicked!');
        // TODO: Implement new task assignment functionality
      },
    },
    {
      id: 2,
      label: 'ارسال اطلاعیه',
      icon: '📢',
      variant: 'secondary' as const,
      onClick: () => {
        console.log('Send announcement clicked!');
        // TODO: Implement announcement functionality
      },
    },
  ];

  const additionalActions = [
    { id: 1, label: 'گزارش‌ها', onClick: () => console.log('Reports clicked!') },
    { id: 2, label: 'تقویم', onClick: () => console.log('Calendar clicked!') },
    { id: 3, label: 'تنظیمات', onClick: () => console.log('Settings clicked!') },
  ];

  return (
    <Card className="bg-card shadow-soft">
      <CardHeader>
        <CardTitle className="text-text-primary text-lg font-bold">
          لینک‌های سریع
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Main Action Buttons */}
        <div className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              onClick={action.onClick}
              className="w-full flex items-center justify-center space-x-2 space-x-reverse"
            >
              <span className="text-lg">{action.icon}</span>
              <span>{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Additional Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-text-secondary mb-2">
            سایر اقدامات سریع:
          </div>
          <div className="flex flex-wrap gap-2">
            {additionalActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLinksWidget;
