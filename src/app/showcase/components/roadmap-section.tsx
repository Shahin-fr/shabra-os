"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { t } from '../utils/i18n';

/**
 * RoadmapSection Component - Completely Re-architected
 * 
 * An epic, visually impressive timeline with enhanced glassmorphism,
 * animated background elements, and wider cards with more content.
 */
export default function RoadmapSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress to timeline animation
  const timelineProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const phases = [
    {
      title: t('roadmap_phase1_title'),
      description: t('roadmap_phase1_desc'),
      status: 'current',
      features: t('roadmap_phase1_features').split(','),
      color: '#E000A0',
      bgPattern: 'grid',
      icon: '🚀'
    },
    {
      title: t('roadmap_phase2_title'),
      description: t('roadmap_phase2_desc'),
      status: 'upcoming',
      features: t('roadmap_phase2_features').split(','),
      color: '#3B82F6',
      bgPattern: 'flowing',
      icon: '⚡'
    },
    {
      title: t('roadmap_phase3_title'),
      description: t('roadmap_phase3_desc'),
      status: 'future',
      features: t('roadmap_phase3_features').split(','),
      color: '#8B5CF6',
      bgPattern: 'nodes',
      icon: '🌐'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'text-[#E000A0] border-[#E000A0] bg-[#E000A0]/10';
      case 'upcoming':
        return 'text-[#3B82F6] border-[#3B82F6] bg-[#3B82F6]/10';
      case 'future':
        return 'text-[#8B5CF6] border-[#8B5CF6] bg-[#8B5CF6]/10';
      default:
        return 'text-[#A1A1A1] border-[#A1A1A1] bg-[#A1A1A1]/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'current':
        return 'Current Phase';
      case 'upcoming':
        return 'Upcoming';
      case 'future':
        return 'Future Vision';
      default:
        return 'Phase';
    }
  };

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

  const titleVariants = {
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

  const phaseVariants = {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const isRTL = (text: string) => {
    return /[\u0600-\u06FF]/.test(text);
  };

  return (
    <section 
      ref={containerRef}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Flowing data lines */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M 0 200 Q 300 100 600 200 T 1200 200"
            stroke="#E000A0"
            strokeWidth="2"
            opacity="0.1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M 0 400 Q 300 300 600 400 T 1200 400"
            stroke="#3B82F6"
            strokeWidth="2"
            opacity="0.1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.path
            d="M 0 600 Q 300 500 600 600 T 1200 600"
            stroke="#8B5CF6"
            strokeWidth="2"
            opacity="0.1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </motion.svg>

        {/* Floating nodes */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-[#E000A0]/20 rounded-full"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 3) * 25}%`
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      <motion.div 
        className="max-w-7xl mx-auto relative z-10"
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Section title */}
        <motion.div 
          className="text-center mb-20"
          variants={titleVariants}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6">
            {t('roadmap_title')}
          </h2>
          <p className="text-lg text-[#A1A1A1] max-w-3xl mx-auto">
            A clear, forward-thinking vision for the future of Shabra OS
          </p>
        </motion.div>

        {/* Epic timeline */}
        <div className="relative">
          {/* Central timeline line */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#E000A0] via-[#3B82F6] to-[#8B5CF6] rounded-full"
            style={{
              height: useTransform(timelineProgress, [0, 1], ['0%', '100%'])
            }}
          />

          {/* Timeline cards */}
          <div className="space-y-16">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
                variants={phaseVariants}
              >
                {/* Timeline node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                  <motion.div
                    className={`w-16 h-16 rounded-full border-4 ${getStatusColor(phase.status)} flex items-center justify-center text-2xl shadow-lg`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {phase.icon}
                  </motion.div>
                </div>

                {/* Phase card - Much wider and more content */}
                <div className={`w-5/12 ${
                  index % 2 === 0 ? 'mr-auto pr-8' : 'ml-auto pl-8'
                }`}>
                  <motion.div
                    className="relative bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 backdrop-blur-xl rounded-3xl border border-[#2A2A2A]/50 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group"
                    whileHover={{ 
                      y: -10,
                      scale: 1.02,
                      boxShadow: `0 25px 50px ${phase.color}20`
                    }}
                  >
                    {/* Status badge */}
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6 ${getStatusColor(phase.status)}`}>
                      {getStatusText(phase.status)}
                    </div>

                    {/* Phase title */}
                    <h3 className={`text-2xl font-bold text-[#F5F5F5] mb-4 ${
                      isRTL(phase.title) ? 'text-right' : 'text-left'
                    }`}>
                      {phase.title}
                    </h3>

                    {/* Phase description */}
                    <p className={`text-[#A1A1A1] mb-6 leading-relaxed ${
                      isRTL(phase.description) ? 'text-right' : 'text-left'
                    }`}>
                      {phase.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-3">
                      <h4 className={`text-lg font-semibold text-[#F5F5F5] ${
                        isRTL('Key Features') ? 'text-right' : 'text-left'
                      }`}>
                        Key Features
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {phase.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            className="flex items-start space-x-3 rtl:space-x-reverse"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: featureIndex * 0.1 }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                              style={{ backgroundColor: phase.color }}
                            />
                            <span className={`text-sm text-[#A1A1A1] ${
                              isRTL(feature) ? 'text-right' : 'text-left'
                            }`}>
                              {feature.trim()}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Animated background pattern */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                      {phase.bgPattern === 'grid' && (
                        <div className="absolute inset-0 opacity-5">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <pattern id={`grid-${index}`} width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke={phase.color} strokeWidth="0.5"/>
                              </pattern>
                            </defs>
                            <rect width="100" height="100" fill={`url(#grid-${index})`} />
                          </svg>
                        </div>
                      )}
                      
                      {phase.bgPattern === 'flowing' && (
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            background: [
                              `linear-gradient(45deg, ${phase.color}10 0%, transparent 50%)`,
                              `linear-gradient(225deg, ${phase.color}10 0%, transparent 50%)`,
                              `linear-gradient(45deg, ${phase.color}10 0%, transparent 50%)`
                            ]
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                      
                      {phase.bgPattern === 'nodes' && (
                        <div className="absolute inset-0 opacity-10">
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: phase.color,
                                left: `${10 + i * 12}%`,
                                top: `${20 + (i % 3) * 20}%`
                              }}
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0.8, 0.3]
                              }}
                              transition={{
                                duration: 2 + i * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Subtle glow effect */}
                    <div 
                      className="absolute inset-0 rounded-3xl pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${phase.color}10 0%, transparent 70%)`
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom transition */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-[#E000A0]"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm font-medium">The journey continues</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}