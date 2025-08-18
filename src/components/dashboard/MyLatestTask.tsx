"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

const latestTask = {
  id: 1,
  title: "طراحی لوگوی جدید",
  completed: false,
  priority: "high"
};

export function MyLatestTask() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
            <CheckSquare className="h-4 w-4 text-[#ff0a54]" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              آخرین وظیفه من
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`p-3 rounded-lg border-l-4 ${getPriorityColor(latestTask.priority)} bg-white/5`}>
          <p className="text-sm font-medium text-gray-900 leading-relaxed">
            {latestTask.title}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(latestTask.priority).replace('border-l-', 'bg-')}`}></div>
            <span className="text-xs text-gray-600">
              {latestTask.priority === 'high' ? 'اولویت بالا' : 
               latestTask.priority === 'medium' ? 'اولویت متوسط' : 'اولویت پایین'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
