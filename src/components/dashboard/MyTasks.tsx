'use client';

import { CheckSquare } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { CardHeaderWithIcon } from '@/components/ui/CardHeaderWithIcon';
import { Checkbox } from '@/components/ui/checkbox';
import { mockTasks } from '@/lib/mock-data';

export function MyTasks() {
  const [taskList, setTaskList] = useState(mockTasks);

  const toggleTask = (taskId: number) => {
    setTaskList(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getPriorityColor = () => {
    // Removed colored borders - now using consistent styling
    return 'border-l-gray-200';
  };

  return (
    <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl w-full'>
      <CardHeaderWithIcon
        icon={CheckSquare}
        title='وظایف من'
        subtitle='وظایف محول شده'
      />
      <CardContent>
        <div className='space-y-3 max-h-48 overflow-y-auto pl-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
          {taskList.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${getPriorityColor()} hover:bg-white/5 transition-colors duration-200`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className='data-[state=checked]:bg-[#ff0a54] data-[state=checked]:border-[#ff0a54]'
              />
              <span
                className={`text-sm font-medium flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
              >
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
