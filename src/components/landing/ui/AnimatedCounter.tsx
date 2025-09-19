'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  start?: number;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ 
  end, 
  duration = 2, 
  start = 0, 
  suffix = '', 
  prefix = '' 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(start + (end - start) * easeOutQuart);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  );
}
