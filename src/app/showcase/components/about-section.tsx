'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';

/**
 * AboutSection Component - Grand Creator Spotlight
 * 
 * A signature, expansive final section that gives the creator
 * the spotlight they deserve with a focused, vertical layout.
 */
export default function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const profileVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotateY: -15
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  return (
    <section 
      ref={ref}
      className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 50%, #000000 100%)'
      }}
    >
      {/* Subtle background decoration */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 0.1 : 0 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E000A0] rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#8B5CF6] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-[#06B6D4] rounded-full blur-3xl" />
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Pre-title */}
          <motion.p 
            className="text-lg text-gray-400 tracking-wider mb-6"
            variants={itemVariants}
          >
            درباره سازنده
          </motion.p>

          {/* Name - Hero Element */}
          <motion.h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
            variants={itemVariants}
          >
            شاهین فرهمند
          </motion.h2>

          {/* Title */}
          <motion.p 
            className="text-xl text-gray-400 mb-8"
            variants={itemVariants}
          >
            Product Builder & Software Developer
          </motion.p>

          {/* Profile Picture with Animated Ring */}
          <motion.div 
            className="relative mt-8"
            variants={profileVariants}
          >
            {/* Animated Glowing Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-40 h-40 rounded-full border-2 border-[#E000A0] blur-sm" />
            </motion.div>

            {/* Secondary Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <div className="w-40 h-40 rounded-full border border-[#E000A0] blur-md" />
            </motion.div>

            {/* Main Profile Circle */}
            <div className="relative w-40 h-40 bg-gradient-to-br from-[#E000A0] to-[#B8008A] rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10">
              <span className="text-5xl font-bold text-white">ش</span>
            </div>

            {/* Hover Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-0"
              whileHover={{
                opacity: 0.3,
                scale: 1.1
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full h-full bg-gradient-to-br from-[#E000A0] to-[#B8008A] rounded-full blur-lg" />
            </motion.div>
          </motion.div>

          {/* Bio Text */}
          <motion.p 
            className="mt-8 max-w-xl text-center text-gray-300 leading-relaxed text-lg"
            variants={itemVariants}
          >
            من به ساختن محصولاتی علاقه‌مندم که مسائل واقعی را حل می‌کنند. این پروژه، سفر من در تبدیل یک چالش روزمره به یک راه‌حل نرم‌افزاری بود.
          </motion.p>

          {/* Final CTA Button */}
          <motion.div 
            className="mt-12"
            variants={itemVariants}
          >
            <Button
              asChild
              variant="outline"
              className="bg-transparent border-[#E000A0] text-[#E000A0] hover:bg-[#E000A0] hover:text-white transition-all duration-300 px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-[#E000A0]/25"
            >
              <a 
                href="https://shahinfarhadi.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                وب‌سایت شخصی من
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}