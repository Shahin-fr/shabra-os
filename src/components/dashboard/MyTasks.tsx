"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare } from 'lucide-react';
import { useState } from 'react';

const tasks = [
  {
    id: 1,
    title: "طراحی لوگوی جدید",
    completed: false,
    priority: "high"
  },
  {
    id: 2,
    title: "آماده‌سازی محتوای هفته آینده",
    completed: false,
    priority: "medium"
  },
  {
    id: 3,
    title: "بررسی گزارش‌های ماهانه",
    completed: true,
    priority: "low"
  },
  {
    id: 4,
    title: "به‌روزرسانی استوری‌های اینستاگرام",
    completed: false,
    priority: "high"
  },
  {
    id: 5,
    title: "جلسه تیم هفتگی",
    completed: false,
    priority: "medium"
  }
];

export function MyTasks() {
  const [taskList, setTaskList] = useState(tasks);

  const toggleTask = (taskId: number) => {
    setTaskList(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const getPriorityColor = () => {
    // Removed colored borders - now using consistent styling
    return 'border-l-gray-200';
  };

  return (
    <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-[#ff0a54]" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              وظایف من
            </CardTitle>
            <p className="text-sm text-gray-600">وظایف محول شده</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-48 overflow-y-auto pl-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {taskList.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${getPriorityColor()} hover:bg-white/5 transition-colors duration-200`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="data-[state=checked]:bg-[#ff0a54] data-[state=checked]:border-[#ff0a54]"
              />
              <span className={`text-sm font-medium flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
