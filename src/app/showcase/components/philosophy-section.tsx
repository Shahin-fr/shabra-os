"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { Link2, Feather, Zap } from 'lucide-react';

/**
 * PhilosophySection Component - Core Principles
 * 
 * Explains the approach to solving the problem through three core principles:
 * Integration, Simplicity, and Efficiency.
 */
export default function PhilosophySection() {
  const isMobile = useIsMobile();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const iconVariants = {
    hidden: { 
      scale: 0,
      rotate: -180
    },
    visible: { 
      scale: 1,
      rotate: 0
    }
  };

  const principles = [
    {
      icon: Link2,
      title: "یکپارچه‌سازی",
      description: "تمام ابزارها و اطلاعات باید در یک نقطه قابل دسترس باشن. هدف اصلی، از بین بردن جابجایی‌های غیرضروری و ایجاد یک منبع واحد برای تیم بود.",
      color: "#E000A0",
      gradientColor: "rgba(224, 0, 160, 0.08)"
    },
    {
      icon: Feather,
      title: "سادگی",
      description: "راه حل نباید از خود مشکل پیچیده‌تر باشه. هر ویژگی جدید باید کارها رو ساده‌تر کنه، نه اینکه یک لایه پیچیدگی جدید اضافه کنه.",
      color: "#3B82F6",
      gradientColor: "rgba(59, 130, 246, 0.08)"
    },
    {
      icon: Zap,
      title: "کارایی",
      description: "هدف نهایی فقط یکپارچگی نیست، بلکه افزایش بهر‌ه‌وریه. سیستم باید هوشمندانه به ما کمک کنه تا کارهامون رو سریع‌تر و با تمرکز بیشتری انجام بدیم.",
      color: "#8B5CF6",
      gradientColor: "rgba(139, 92, 246, 0.08)"
    }
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden">
      <motion.div 
        className="max-w-6xl mx-auto"
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6"
            variants={itemVariants}
          >
            سه اصل راهنما در این مسیر
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-[#A1A1A1] max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            برای اینکه این ایده بزرگ رو به قدم‌های کوچک‌تر تقسیم کنم، سه اصل کلیدی رو به عنوان راهنمای خودم در نظر گرفتم:
          </motion.p>
        </motion.div>

        {/* Principles Grid - Mobile optimized */}
        <motion.div 
          className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-3 gap-8'}`}
          variants={containerVariants}
        >
          {principles.map((principle, index) => {
            const IconComponent = principle.icon;
            return (
              <motion.div
                key={principle.title}
                className="group"
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
              >
                <div 
                  className={`
                    relative ${isMobile ? 'p-6' : 'p-8'} rounded-2xl border border-[#2A2A2A] 
                    hover:border-[#E000A0]/40 hover:shadow-xl hover:shadow-[#E000A0]/20 
                    transition-all duration-500 h-full flex flex-col items-center text-center
                    overflow-hidden
                  `}
                  style={{
                    background: `radial-gradient(circle at center, ${principle.gradientColor} 0%, transparent 60%), #111111`
                  }}
                >
                  {/* Enhanced Radial Gradient on Hover */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${principle.gradientColor.replace('0.08', '0.15')} 0%, transparent 70%)`
                    }}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`
                      relative z-10 ${isMobile ? 'w-16 h-16 mb-4' : 'w-20 h-20 mb-6'} rounded-full 
                      flex items-center justify-center
                      shadow-lg group-hover:shadow-xl transition-all duration-300
                    `}
                    style={{ backgroundColor: principle.color }}
                    variants={iconVariants}
                    transition={{ duration: 0.8, ease: "backOut" }}
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <IconComponent 
                      size={isMobile ? 24 : 32} 
                      className="group-hover:scale-110 transition-transform duration-300"
                      style={{ color: "#FFFFFF" }}
                    />
                  </motion.div>

                  {/* Title */}
                  <motion.h3 
                    className={`relative z-10 ${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white ${isMobile ? 'mb-3' : 'mb-4'} 
                      group-hover:text-[#E000A0] transition-colors duration-300`}
                    variants={itemVariants}
                  >
                    {principle.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p 
                    className={`relative z-10 ${isMobile ? 'text-sm' : 'text-base'} text-gray-300 leading-relaxed 
                      group-hover:text-gray-100 transition-colors duration-300`}
                    variants={itemVariants}
                  >
                    {principle.description}
                  </motion.p>

                  {/* Decorative Elements */}
                  <motion.div
                    className="absolute top-4 end-4 w-2 h-2 rounded-full opacity-60 z-10"
                    style={{ backgroundColor: principle.color }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Decorative Line */}
        <motion.div
          className="mt-16 flex justify-center"
          variants={itemVariants}
        >
          <motion.div
            className="w-32 h-1 bg-gradient-to-r from-[#E000A0] via-[#3B82F6] to-[#8B5CF6] rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
