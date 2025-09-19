'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
        style={{ width: `${scrollProgress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}
