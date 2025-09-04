'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
}

interface QuickActionCardProps {
  action: QuickAction;
  className?: string;
}

export function QuickActionCard({ action, className }: QuickActionCardProps) {
  const ActionIcon = action.icon;

  const handleClick = () => {
    window.location.href = action.href;
  };

  return (
    <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
      <motion.button
        onClick={handleClick}
        className={`w-full p-4 rounded-xl border border-gray-200/50 transition-all duration-200 hover:shadow-lg hover:border-[#ff0a54]/20 ${className}`}
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        }}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
      >
        <div className='flex flex-col items-center gap-3'>
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} text-white shadow-lg`}
          >
            <ActionIcon className='h-6 w-6' />
          </div>

          {/* Title */}
          <span className='text-sm font-medium text-gray-900 text-center'>
            {action.title}
          </span>
        </div>

        {/* Hover Effect */}
        <motion.div
          className='absolute inset-0 rounded-xl bg-[#ff0a54]/5 opacity-0'
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    </motion.div>
  );
}
