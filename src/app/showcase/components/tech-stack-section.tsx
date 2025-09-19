'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * TechStackSection Component - Completely Re-architected
 * 
 * A clean, minimalist tech stack showcase with centered title
 * and grid of technology logos.
 */
export default function TechStackSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Tech stack data
  const techStack = [
    { name: 'Next.js', icon: '⚡', color: '#000000' },
    { name: 'React', icon: '⚛️', color: '#61DAFB' },
    { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
    { name: 'Tailwind CSS', icon: '🎨', color: '#06B6D4' },
    { name: 'Framer Motion', icon: '🎬', color: '#0055FF' },
    { name: 'Prisma', icon: '🗄️', color: '#2D3748' },
    { name: 'PostgreSQL', icon: '🐘', color: '#336791' },
    { name: 'Vercel', icon: '▲', color: '#000000' },
    { name: 'Node.js', icon: '🟢', color: '#339933' },
    { name: 'Docker', icon: '🐳', color: '#2496ED' },
    { name: 'Git', icon: '📦', color: '#F05032' },
    { name: 'ESLint', icon: '🔍', color: '#4B32C3' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const techItemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotateY: -90
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0
    }
  };

  return (
    <section 
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden"
    >
      <motion.div 
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Section Title */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6">
            تکنولوژی‌های استفاده شده
          </h2>
          <p className="text-lg sm:text-xl text-[#A1A1A1] max-w-3xl mx-auto leading-relaxed">
            مجموعه‌ای از بهترین و مدرن‌ترین تکنولوژی‌ها برای ایجاد تجربه‌ای بی‌نظیر
          </p>
        </motion.div>

        {/* Tech Stack Grid */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
          variants={containerVariants}
        >
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              className="group"
              variants={techItemVariants}
              whileHover={{ 
                scale: 1.1,
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex flex-col items-center justify-center p-6 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] hover:border-[#E000A0]/50 transition-all duration-300 cursor-pointer group-hover:shadow-lg group-hover:shadow-[#E000A0]/10">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${tech.color}20` }}
                >
                  {tech.icon}
                </div>
                <span className="text-sm font-medium text-[#F5F5F5] group-hover:text-[#E000A0] transition-colors duration-300 text-center">
                  {tech.name}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Subtle background decoration */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 0.05 : 0 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#E000A0] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#8B5CF6] rounded-full blur-3xl" />
        </motion.div>
      </motion.div>
    </section>
  );
}