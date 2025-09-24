'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

interface AnimatedTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index?: number;
  delay?: number;
  children?: React.ReactNode;
  className?: string;
}

export const AnimatedTableRow = forwardRef<HTMLTableRowElement, AnimatedTableRowProps>(
  ({ children, index = 0, delay = 0, ...props }, ref) => {
    // Filter out conflicting HTML events that conflict with Framer Motion
    const { 
      onDrag,
      onDragStart,
      onDragEnd,
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      onTransitionStart,
      onTransitionEnd,
      ...motionProps 
    } = props;
    
    return (
      <motion.tr
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 + delay }}
        {...motionProps}
      >
        {children}
      </motion.tr>
    );
  }
);

AnimatedTableRow.displayName = 'AnimatedTableRow';
