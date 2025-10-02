'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import {
  siNextdotjs,
  siReact,
  siTypescript,
  siTailwindcss,
  siPostgresql,
  siPrisma,
  siVercel,
  siNodedotjs,
  siDocker,
  siGit,
  siFramer,
  siEslint
} from 'simple-icons';

/**
 * TechStackSection Component - "Floating Galaxy of Technologies"
 * 
 * A stunning, dynamic showcase of technology logos in a floating galaxy layout.
 * Features high-quality SVG icons, varying sizes, and elegant micro-interactions.
 */
export default function TechStackSection() {
  const isMobile = useIsMobile() ?? false;
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Tech stack data with official SVG icons and optimized colors for dark background
  const techStack = [
    { 
      icon: siNextdotjs, 
      name: 'Next.js', 
      color: '#FFFFFF', // White for visibility on dark background
      size: 'large' // Core technology
    },
    { 
      icon: siReact, 
      name: 'React', 
      color: '#61DAFB', // Keep original bright blue
      size: 'large' // Core technology
    },
    { 
      icon: siTypescript, 
      name: 'TypeScript', 
      color: '#3178C6', // Keep original blue
      size: 'large' // Core technology
    },
    { 
      icon: siTailwindcss, 
      name: 'Tailwind', // Simplified label
      color: '#06B6D4', // Keep original teal
      size: 'medium'
    },
    { 
      icon: siPrisma, 
      name: 'Prisma', 
      color: '#FFFFFF', // White for visibility on dark background
      size: 'medium'
    },
    { 
      icon: siPostgresql, 
      name: 'PostgreSQL', 
      color: '#336791', // Keep original blue-grey
      size: 'medium'
    },
    { 
      icon: siVercel, 
      name: 'Vercel', 
      color: '#FFFFFF', // White for visibility on dark background
      size: 'medium'
    },
    { 
      icon: siNodedotjs, 
      name: 'Node.js', 
      color: '#339933', // Keep original green
      size: 'medium'
    },
    { 
      icon: siDocker, 
      name: 'Docker', 
      color: '#2496ED', // Keep original blue
      size: 'small'
    },
    { 
      icon: siGit, 
      name: 'Git', 
      color: '#F05032', // Keep original orange-red
      size: 'small'
    },
    { 
      icon: siFramer, 
      name: 'Framer', 
      color: '#0055FF', // Keep original blue
      size: 'small'
    },
    { 
      icon: siEslint, 
      name: 'ESLint', 
      color: '#4B32C3', // Keep original purple
      size: 'small'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
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
      scale: 0.7,
      y: 20,
      rotateY: -15
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      rotateY: 0
    }
  };

  // Consistent sizing for clean grid layout
  const getSizeClasses = (_size: string) => {
    const baseClasses = "flex flex-col items-center justify-center transition-all duration-300";
    
    // All icons now have consistent sizing for clean grid appearance
    return `${baseClasses} ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`;
  };

  const getIconSize = (_size: string) => {
    // Consistent icon sizes for clean grid
    return isMobile ? 28 : 36;
  };

  const getTextSize = (_size: string) => {
    // Consistent text sizing
    return isMobile ? 'text-xs' : 'text-sm';
  };

  return (
    <section 
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden"
    >
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Section Title */}
        <motion.div 
          className="text-center mb-20"
          variants={titleVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6">
            تکنولوژی‌های استفاده شده
          </h2>
          <p className="text-lg sm:text-xl text-[#A1A1A1] max-w-3xl mx-auto leading-relaxed">
            مجموعه‌ای از ابزارهای مدرن و قابل اعتماد که سرعت توسعه و پایداری پروژه رو تضمین می‌کنن.
          </p>
        </motion.div>

        {/* Clean Two-Row Tech Stack Grid */}
        <motion.div 
          className="relative flex justify-center"
          variants={containerVariants}
        >
          {/* Perfectly organized responsive grid: 2x3 on mobile, 2x6 on desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 sm:gap-8 lg:gap-12 max-w-5xl">
            {techStack.map((tech, _index) => (
              <motion.div
                key={tech.name}
                className="group cursor-pointer flex flex-col items-center justify-center"
                variants={techItemVariants}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ 
                  scale: 1.1,
                  y: -8,
                  transition: { 
                    duration: 0.3,
                    ease: "easeOut"
                  }
                }}
              >
                <div className={getSizeClasses(tech.size)}>
                  {/* Icon with hover glow effect */}
                  <motion.div
                    className="relative"
                    whileHover={{
                      filter: `drop-shadow(0 0 20px ${tech.color}40)`,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <svg
                      width={getIconSize(tech.size)}
                      height={getIconSize(tech.size)}
                      viewBox="0 0 24 24"
                      fill={tech.color}
                      className="transition-all duration-300 group-hover:scale-110"
                    >
                      <path d={tech.icon.path} />
                    </svg>
                  </motion.div>
                  
                  {/* Technology name */}
                  <motion.span 
                    className={`${getTextSize(tech.size)} font-medium text-[#A1A1A1] group-hover:text-[#F5F5F5] transition-colors duration-300 text-center mt-3`}
                    whileHover={{
                      color: tech.color,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {tech.name}
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Subtle floating background elements */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 0.03 : 0 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-[#E000A0] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 end-1/4 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl" />
          <div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#06B6D4] rounded-full blur-3xl" />
        </motion.div>
      </motion.div>
    </section>
  );
}