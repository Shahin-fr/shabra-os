"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * PhilosophySection Component - Core Principles
 * 
 * Explains the approach to solving the problem through three core principles:
 * Integration, Simplicity, and Efficiency.
 */
export default function PhilosophySection() {
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
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { 
      scale: 0,
      rotate: -180
    },
    visible: { 
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "backOut"
      }
    }
  };

  const principles = [
    {
      icon: "🔗",
      title: "یکپارچه‌سازی",
      description: "پایان دادن به جابجایی مداوم بین پلتفرم‌ها و ایجاد یک منبع حقیقت واحد.",
      color: "from-[#E000A0] to-[#B8008A]",
      bgColor: "bg-[#E000A0]/10",
      borderColor: "border-[#E000A0]/30"
    },
    {
      icon: "✨",
      title: "سادگی",
      description: "طراحی ابزارهایی که استفاده از آنها بصری و بدون نیاز به آموزش پیچیده باشد.",
      color: "from-[#3B82F6] to-[#1D4ED8]",
      bgColor: "bg-[#3B82F6]/10",
      borderColor: "border-[#3B82F6]/30"
    },
    {
      icon: "⚡",
      title: "کارایی",
      description: "تمرکز بر خودکارسازی کارهای تکراری تا تیم بتواند روی وظایف خلاقانه و استراتژیک تمرکز کند.",
      color: "from-[#8B5CF6] to-[#7C3AED]",
      bgColor: "bg-[#8B5CF6]/10",
      borderColor: "border-[#8B5CF6]/30"
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
        >
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6"
            variants={itemVariants}
          >
            فلسفه راه حل: یکپارچگی، سادگی و کارایی
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-[#A1A1A1] max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            رویکرد ما برای حل چالش‌های بهره‌وری بر سه اصل اساسی استوار است که هر کدام بخشی از راه‌حل جامع را تشکیل می‌دهند.
          </motion.p>
        </motion.div>

        {/* Principles Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              className="group"
              variants={itemVariants}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <div className={`
                relative p-8 rounded-2xl border-2 ${principle.borderColor} ${principle.bgColor}
                backdrop-blur-sm bg-gradient-to-br from-white/5 to-white/10
                hover:shadow-2xl hover:shadow-[#E000A0]/10 transition-all duration-500
                h-full flex flex-col items-center text-center
              `}>
                {/* Animated Background Glow */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${principle.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.1 }}
                />

                {/* Icon */}
                <motion.div
                  className={`
                    w-20 h-20 rounded-full bg-gradient-to-br ${principle.color} 
                    flex items-center justify-center text-3xl mb-6
                    shadow-lg group-hover:shadow-xl transition-shadow duration-300
                  `}
                  variants={iconVariants}
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  {principle.icon}
                </motion.div>

                {/* Title */}
                <motion.h3 
                  className="text-xl font-bold text-[#F5F5F5] mb-4 group-hover:text-white transition-colors duration-300"
                  variants={itemVariants}
                >
                  {principle.title}
                </motion.h3>

                {/* Description */}
                <motion.p 
                  className="text-[#A1A1A1] leading-relaxed group-hover:text-[#E5E5E5] transition-colors duration-300"
                  variants={itemVariants}
                >
                  {principle.description}
                </motion.p>

                {/* Decorative Elements */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gradient-to-r from-[#E000A0] to-[#B8008A] opacity-60"
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
          ))}
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
