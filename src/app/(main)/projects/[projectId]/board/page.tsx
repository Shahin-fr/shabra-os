'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowRight, Settings, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import TaskCard, { TaskCardProps } from '@/components/ui/TaskCard';

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  tags?: string[];
  assignees?: Array<{ src?: string; alt: string; }>;
  isCompleted?: boolean;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  isOver?: boolean;
}

interface DraggableTaskProps {
  task: Task;
  isDragging?: boolean;
}

// Mock data
const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'برای انجام',
    tasks: [
      {
        id: '1',
        title: 'طراحی رابط کاربری داشبورد',
        description: 'طراحی و پیاده‌سازی رابط کاربری اصلی داشبورد با استفاده از سیستم طراحی شبرا',
        priority: 'high',
        dueDate: '1403/10/15',
        tags: ['UI/UX', 'Frontend'],
        assignees: [{ alt: 'علی احمدی' }, { alt: 'فاطمه رضایی' }],
        isCompleted: false,
        columnId: 'todo',
      },
      {
        id: '2',
        title: 'پیاده‌سازی سیستم احراز هویت',
        description: 'پیاده‌سازی کامل سیستم ورود و ثبت‌نام با امنیت بالا',
        priority: 'high',
        dueDate: '1403/10/20',
        tags: ['Backend', 'Security'],
        assignees: [{ alt: 'محمد کریمی' }],
        isCompleted: false,
        columnId: 'todo',
      },
      {
        id: '3',
        title: 'بهینه‌سازی عملکرد پایگاه داده',
        description: 'بررسی و بهینه‌سازی کوئری‌های پایگاه داده برای بهبود سرعت',
        priority: 'medium',
        dueDate: '1403/10/25',
        tags: ['Database', 'Performance'],
        assignees: [{ alt: 'سارا محمدی' }, { alt: 'حسن رضایی' }],
        isCompleted: false,
        columnId: 'todo',
      },
    ],
  },
  {
    id: 'inProgress',
    title: 'در حال انجام',
    tasks: [
      {
        id: '4',
        title: 'تست‌های واحد برای کامپوننت‌ها',
        description: 'نوشتن تست‌های جامع برای تمام کامپوننت‌های React',
        priority: 'medium',
        dueDate: '1403/10/18',
        tags: ['Testing', 'Frontend'],
        assignees: [{ alt: 'علی احمدی' }],
        isCompleted: false,
        columnId: 'inProgress',
      },
      {
        id: '5',
        title: 'پیاده‌سازی API های RESTful',
        description: 'طراحی و پیاده‌سازی API های مورد نیاز برای ارتباط با فرانت‌اند',
        priority: 'high',
        dueDate: '1403/10/22',
        tags: ['Backend', 'API'],
        assignees: [{ alt: 'محمد کریمی' }, { alt: 'فاطمه رضایی' }],
        isCompleted: false,
        columnId: 'inProgress',
      },
    ],
  },
  {
    id: 'done',
    title: 'انجام شده',
    tasks: [
      {
        id: '6',
        title: 'راه‌اندازی پروژه و تنظیمات اولیه',
        description: 'راه‌اندازی پروژه Next.js و تنظیم تمام وابستگی‌ها',
        priority: 'low',
        dueDate: '1403/10/10',
        tags: ['Setup', 'DevOps'],
        assignees: [{ alt: 'سارا محمدی' }],
        isCompleted: true,
        columnId: 'done',
      },
      {
        id: '7',
        title: 'طراحی سیستم طراحی (Design System)',
        description: 'ایجاد سیستم طراحی جامع برای پروژه شبرا',
        priority: 'high',
        dueDate: '1403/10/12',
        tags: ['Design', 'UI/UX'],
        assignees: [{ alt: 'فاطمه رضایی' }],
        isCompleted: true,
        columnId: 'done',
      },
    ],
  },
];

// Draggable Task Component
const DraggableTask: React.FC<DraggableTaskProps> = ({ task, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskCardProps: TaskCardProps = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    tags: task.tags,
    assignees: task.assignees,
    isCompleted: task.isCompleted,
    className: isDragging ? 'opacity-50 scale-105 shadow-2xl' : '',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard {...taskCardProps} />
    </div>
  );
};

// Kanban Column Component
const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, isOver = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex-shrink-0 w-80 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-pink-200/50
        shadow-lg min-h-[600px] transition-all duration-200
        ${isOver ? 'border-pink-400 shadow-xl scale-105' : 'hover:shadow-xl'}
      `}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-pink-200/50 bg-gradient-to-r from-pink-50 to-pink-100/50 rounded-t-xl">
        <h3 className="text-lg font-semibold text-pink-700 text-center">
          {column.title}
        </h3>
        <div className="text-sm text-pink-600 text-center mt-1">
          {tasks.length} وظیفه
        </div>
      </div>

      {/* Column Content */}
      <div className="p-4 flex-1">
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-[400px]">
            {tasks.map(task => (
              <DraggableTask key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-pink-300 rounded-lg bg-pink-50/30">
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <div>هیچ وظیفه‌ای وجود ندارد</div>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

// Main Kanban Board Component
const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active task
    const activeTask = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === activeId);

    if (!activeTask) return;

    // Check if dropping on a column
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      // Moving to a different column
      setColumns(prevColumns => {
        const newColumns = prevColumns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => task.id !== activeId),
        }));

        const targetColumn = newColumns.find(col => col.id === overId);
        if (targetColumn) {
          targetColumn.tasks.push({
            ...activeTask,
            columnId: String(overId),
          });
        }

        return newColumns;
      });
      return;
    }

    // Check if dropping on another task
    const overTask = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === overId);

    if (overTask && activeTask.columnId === overTask.columnId) {
      // Reordering within the same column
      setColumns(prevColumns => {
        const newColumns = prevColumns.map(col => {
          if (col.id === activeTask.columnId) {
            const taskIds = col.tasks.map(task => task.id);
            const oldIndex = taskIds.indexOf(String(activeId));
            const newIndex = taskIds.indexOf(String(overId));
            const newTaskIds = arrayMove(taskIds, oldIndex, newIndex);
            
            return {
              ...col,
              tasks: newTaskIds.map(id => col.tasks.find(task => task.id === id)!),
            };
          }
          return col;
        });
        return newColumns;
      });
    } else if (overTask && activeTask.columnId !== overTask.columnId) {
      // Moving to a different column
      setColumns(prevColumns => {
        const newColumns = prevColumns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => task.id !== activeId),
        }));

        const targetColumn = newColumns.find(col => col.id === overTask.columnId);
        if (targetColumn) {
          const overIndex = targetColumn.tasks.findIndex(task => task.id === overId);
          targetColumn.tasks.splice(overIndex, 0, {
            ...activeTask,
            columnId: overTask.columnId,
          });
        }

        return newColumns;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 min-h-[700px]">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={column.tasks}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90">
            <TaskCard
              title={activeTask.title}
              description={activeTask.description}
              priority={activeTask.priority}
              dueDate={activeTask.dueDate}
              tags={activeTask.tags}
              assignees={activeTask.assignees}
              isCompleted={activeTask.isCompleted}
              className="shadow-2xl scale-105 rotate-2"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Main Page Component
export default function BoardPage() {
  // const params = useParams();
  const router = useRouter();
  // const projectId = params.projectId as string;

  // Mock project data
  const projectName = 'پروژه شبرا - سیستم مدیریت پروژه';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Right side - Project title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
              >
                <ArrowRight className="w-4 h-4 ms-2" />
                بازگشت
              </Button>
              <div className="h-6 w-px bg-pink-300" />
              <h1 className="text-xl font-bold text-pink-700">
                {projectName}
              </h1>
            </div>

            {/* Left side - Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-pink-600 border-pink-200 hover:bg-pink-50"
              >
                <Plus className="w-4 h-4 ms-2" />
                افزودن وظیفه
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            برد کانبان پروژه
          </h2>
          <p className="text-gray-600">
            وظایف پروژه را به صورت بصری مدیریت کنید و پیشرفت کار را دنبال کنید
          </p>
        </div>

        {/* Kanban Board */}
        <KanbanBoard />
      </div>
    </div>
  );
}
