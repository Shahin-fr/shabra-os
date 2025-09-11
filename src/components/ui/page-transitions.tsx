'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Slide transition variants
export const slideVariants = {
  initial: {
    x: '100%',
    opacity: 0
  },
  in: {
    x: 0,
    opacity: 1
  },
  out: {
    x: '-100%',
    opacity: 0
  }
};

// Fade transition variants
export const fadeVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

// Scale transition variants
export const scaleVariants = {
  initial: {
    scale: 0.95,
    opacity: 0
  },
  in: {
    scale: 1,
    opacity: 1
  },
  out: {
    scale: 1.05,
    opacity: 0
  }
};

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={slideVariants}
      transition={{
        type: 'tween',
        ease: 'easeInOut',
        duration: 0.3
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={fadeVariants}
      transition={{
        type: 'tween',
        ease: 'easeInOut',
        duration: 0.2
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={scaleVariants}
      transition={{
        type: 'tween',
        ease: 'easeInOut',
        duration: 0.2
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Modal transition variants
export const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0
  },
  out: {
    opacity: 0,
    scale: 0.8,
    y: 50
  }
};

export function ModalTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={modalVariants}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Mobile-specific transitions
export const mobileSlideVariants = {
  initial: {
    x: '100%',
    opacity: 0
  },
  in: {
    x: 0,
    opacity: 1
  },
  out: {
    x: '-100%',
    opacity: 0
  }
};

export function MobilePageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={mobileSlideVariants}
      transition={{
        type: 'tween',
        ease: [0.25, 0.46, 0.45, 0.94],
        duration: 0.4
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}