"use client";

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { t } from '../utils/i18n';

/**
 * HeroSection Component - Completely Re-architected
 * 
 * A cinematic hero section with sophisticated animated graphics,
 * refined typography, and narrative-driven design.
 */
export default function HeroSection() {
  const isMobile = useIsMobile();
  const [, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { damping: 20 });
  
  const glowX = useTransform(springX, (value) => value - 200);
  const glowY = useTransform(springY, (value) => value - 200);

  const controls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // Only add mouse move listener on desktop
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    // Start entrance animation
    controls.start("visible");
    
    return () => {
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [mouseX, mouseY, controls, isMobile]);

  // Animation variants
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
      scale: 1
    }
  };

  const logoVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.8,
      rotate: -5
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotate: 0
    }
  };

  const visualVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  return (
    <section className={`relative ${isMobile ? 'min-h-[80vh] py-8' : 'min-h-screen'} flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden`}>
      {/* Animated background elements - reduced on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating geometric shapes */}
          <motion.div
            className="absolute top-20 start-10 w-32 h-32 border border-[#E000A0]/20 rounded-full"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 end-20 w-24 h-24 border border-[#E000A0]/15 rounded-lg"
            animate={{
              y: [0, 30, 0],
              rotate: [0, -90, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-40 start-1/4 w-16 h-16 border border-[#E000A0]/10 rounded-full"
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
      )}

      {/* Interactive cursor glow - only on desktop */}
      {!isMobile && (
        <motion.div
          className="absolute pointer-events-none z-10"
          style={{
            x: glowX,
            y: glowY,
          }}
        >
          <div className="w-96 h-96 bg-gradient-radial from-[#E000A0]/20 via-[#E000A0]/5 to-transparent rounded-full blur-3xl" />
        </motion.div>
      )}

      <motion.div 
        className="max-w-7xl mx-auto text-center relative z-20"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Brand logo */}
        <motion.div 
          className="mb-8"
          variants={logoVariants}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#E000A0] to-[#B8008A] rounded-2xl shadow-2xl shadow-[#E000A0]/25">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
        </motion.div>

        {/* Main headline - mobile optimized typography */}
        <motion.h1 
          className={`${isMobile ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl lg:text-6xl'} font-bold text-[#F5F5F5] ${isMobile ? 'mb-4' : 'mb-6'} leading-tight`}
          variants={itemVariants}
        >
          {t('hero_brand_name')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className={`${isMobile ? 'text-base sm:text-lg' : 'text-lg sm:text-xl lg:text-2xl'} text-[#A1A1A1] ${isMobile ? 'mb-6' : 'mb-8'} max-w-4xl mx-auto leading-relaxed`}
          variants={itemVariants}
        >
          {t('hero_title')}
        </motion.p>

        {/* Description */}
        <motion.p 
          className={`${isMobile ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} text-[#666666] ${isMobile ? 'mb-8' : 'mb-12'} max-w-3xl mx-auto leading-relaxed`}
          variants={itemVariants}
        >
          {t('hero_subtitle')}
        </motion.p>

        {/* Sophisticated animated visual - mobile optimized */}
        <motion.div 
          className={`relative ${isMobile ? 'max-w-sm' : 'max-w-4xl'} mx-auto`}
          variants={visualVariants}
        >
          <div className={`relative bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-3xl border border-[#2A2A2A] ${isMobile ? 'p-4' : 'p-8'} shadow-2xl`}>
            {/* Animated dashboard mockup */}
            <div className={`relative ${isMobile ? 'h-48' : 'h-80'} bg-[#0A0A0A] rounded-2xl overflow-hidden`}>
              {/* Animated grid background */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E000A0" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              {/* Animated dashboard elements */}
              <motion.div
                className="absolute top-6 start-6 w-32 h-20 bg-gradient-to-r from-[#E000A0]/20 to-[#E000A0]/10 rounded-lg border border-[#E000A0]/30"
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute top-6 end-6 w-24 h-16 bg-gradient-to-r from-[#E000A0]/15 to-[#E000A0]/5 rounded-lg border border-[#E000A0]/20"
                animate={{
                  scale: [1, 1.03, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              <motion.div
                className="absolute bottom-6 start-6 w-40 h-24 bg-gradient-to-r from-[#E000A0]/10 to-[#E000A0]/5 rounded-lg border border-[#E000A0]/15"
                animate={{
                  scale: [1, 1.01, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              />

              {/* Animated connecting lines */}
              <motion.svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 320"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M 80 50 Q 200 100 320 50"
                  stroke="#E000A0"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                />
                <motion.path
                  d="M 100 280 Q 200 200 300 280"
                  stroke="#E000A0"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.5, delay: 1.5, ease: "easeInOut" }}
                />
              </motion.svg>

              {/* Floating data points */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-[#E000A0] rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3
                  }}
                />
              ))}
            </div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#E000A0]/5 via-transparent to-[#E000A0]/5 pointer-events-none" />
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}