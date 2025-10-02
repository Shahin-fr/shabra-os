'use client';

import { motion } from 'framer-motion';
import { Plus, Users, FileText, Megaphone } from 'lucide-react';
import { ManagerWidget } from '@/components/ui/PerfectWidget';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { CreateMeetingModal } from '@/components/meetings/CreateMeetingModal';
import { CreateAnnouncementModal } from '@/components/announcements/CreateAnnouncementModal';
import { useAuth } from '@/hooks/useAuth';
import { isAdminOrManagerUser } from '@/lib/auth-utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  description: string;
  modalContent: React.ComponentType<{ onClose: () => void }>;
}

interface QuickActionsWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
  priority?: 'high' | 'medium' | 'low';
}

// Modal Components
const AddTaskModal = ({ onClose }: { onClose: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <CreateTaskModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

const CreateProjectModalWrapper = ({ onClose }: { onClose: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <CreateProjectModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

const ScheduleMeetingModalWrapper = ({ onClose }: { onClose: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <CreateMeetingModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

const CreateAnnouncementModalWrapper = ({ onClose }: { onClose: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <CreateAnnouncementModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

const quickActions: QuickAction[] = [
  {
    id: 'assign-task',
    label: 'تسک جدید',
    icon: Plus,
    href: '/tasks/new',
    color: 'bg-brand-pink hover:bg-brand-pink',
    description: 'کار جدید به تیم اختصاص دهید',
    modalContent: AddTaskModal
  },
  {
    id: 'create-project',
    label: 'پروژه جدید',
    icon: FileText,
    href: '/projects/new',
    color: 'bg-status-success hover:bg-status-success',
    description: 'پروژه جدید ایجاد کنید',
    modalContent: CreateProjectModalWrapper
  },
  {
    id: 'schedule-meeting',
    label: 'برنامه‌ریزی جلسه',
    icon: Users,
    href: '/meetings/new',
    color: 'bg-brand-plum hover:bg-brand-plum',
    description: 'جلسه جدید برنامه‌ریزی کنید',
    modalContent: ScheduleMeetingModalWrapper
  },
  {
    id: 'announcement',
    label: 'اعلان',
    icon: Megaphone,
    href: '/announcements/new',
    color: 'bg-status-warning hover:bg-status-warning',
    description: 'اعلان جدید ارسال کنید',
    modalContent: CreateAnnouncementModalWrapper
  },
];

// Helper function to get text color for each button
export function getButtonTextColor(actionId: string): string {
  switch (actionId) {
    case 'assign-task':
      return 'text-brand-pink-text hover:text-brand-pink-text';
    case 'create-project':
      return 'text-status-success-text hover:text-status-success-text';
    case 'schedule-meeting':
      return 'text-brand-plum-text hover:text-brand-plum-text';
    case 'announcement':
      return 'text-status-warning-text hover:text-status-warning-text';
    default:
      return 'text-gray-700 hover:text-gray-700';
  }
}

export function QuickActionsWidget({ className, variant = 'desktop', priority = 'medium' }: QuickActionsWidgetProps) {
  const { user } = useAuth();
  const isMobile = variant === 'mobile';
  
  // Filter actions based on user role
  const filteredActions = quickActions.filter(action => {
    if (action.id === 'schedule-meeting') {
      return isAdminOrManagerUser(user);
    }
    return true; // Show all other actions for all users
  });
  
  const visibleActions = isMobile ? filteredActions.slice(0, 4) : filteredActions;
  const [selectedModal, setSelectedModal] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <ManagerWidget
      title="دسترسی سریع"
      priority={priority}
      className={className}
    >
      <motion.div
        className={cn(
          'grid gap-3',
          isMobile ? 'grid-cols-2' : 'grid-cols-1'
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleActions.map((action) => (
          <motion.div key={action.id} variants={itemVariants} transition={{ duration: 0.3, ease: "easeOut" }}>
            <Button
              onClick={() => setSelectedModal(action.id)}
              className={cn(
                'w-full h-auto p-4 font-vazirmatn transition-all duration-200 hover:scale-105',
                action.color,
                getButtonTextColor(action.id)
              )}
            >
              <div className="flex items-center justify-between w-full">
                {/* TEXT BLOCK (First child) */}
                <div className="text-right">
                  <div className="font-medium text-sm">
                    {action.label}
                  </div>
                  {!isMobile && (
                    <div className="text-xs opacity-90 mt-1">
                      {action.description}
                    </div>
                  )}
                </div>
                
                {/* ICON (Second child) */}
                <action.icon className="h-5 w-5 flex-shrink-0" />
              </div>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Show More Button for Mobile */}
      {isMobile && quickActions.length > 4 && (
        <motion.div
          className="mt-4"
          variants={itemVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Button
            variant="outline"
            className="w-full font-vazirmatn text-sm"
            onClick={() => {
              // Navigate to full quick actions page
              if (typeof window !== 'undefined') {
                window.location.href = '/quick-actions';
              }
            }}
          >
            مشاهده همه اقدامات
          </Button>
        </motion.div>
      )}

      {/* Modal */}
      {selectedModal && (() => {
        const action = quickActions.find(a => a.id === selectedModal);
        if (!action) return null;
        const ModalComponent = action.modalContent;
        return (
          <ModalComponent onClose={() => setSelectedModal(null)} />
        );
      })()}
    </ManagerWidget>
  );
}
