"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { t } from '../utils/i18n';

/**
 * EcosystemSection Component - Completely Re-architected
 * 
 * A full-screen, highly interactive experience showcasing
 * the modular ecosystem with seamless transitions and RTL/LTR support.
 */
export default function EcosystemSection() {
  const isMobile = useIsMobile();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [selectedModule, setSelectedModule] = useState<string | null>('instapulse');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const modules = [
    {
      id: 'task_management',
      name: t('ecosystem_task_management'),
      description: t('ecosystem_task_management_desc'),
      isKey: false,
      icon: '📋',
      color: '#3B82F6',
      details: {
        title: t('modal_task_management_title'),
        description: t('modal_task_management_description'),
        features: t('modal_task_management_features').split(','),
        screenshot: '/api/placeholder/600/400'
      }
    },
    {
      id: 'storyboard',
      name: t('ecosystem_storyboard'),
      description: t('ecosystem_storyboard_desc'),
      isKey: false,
      icon: '🎬',
      color: '#8B5CF6',
      details: {
        title: t('modal_storyboard_title'),
        description: t('modal_storyboard_description'),
        features: t('modal_storyboard_features').split(','),
        screenshot: '/api/placeholder/600/400'
      }
    },
    {
      id: 'instapulse',
      name: t('ecosystem_instapulse'),
      description: t('ecosystem_instapulse_desc'),
      isKey: true,
      icon: '⚡',
      color: '#E000A0',
      details: {
        title: t('modal_instapulse_title'),
        description: t('modal_instapulse_description'),
        features: t('modal_instapulse_features').split(','),
        screenshot: '/api/placeholder/600/400'
      }
    },
    {
      id: 'wiki',
      name: t('ecosystem_wiki'),
      description: t('ecosystem_wiki_desc'),
      isKey: false,
      icon: '📚',
      color: '#10B981',
      details: {
        title: t('modal_wiki_title'),
        description: t('modal_wiki_description'),
        features: t('modal_wiki_features').split(','),
        screenshot: '/api/placeholder/600/400'
      }
    },
    {
      id: 'hr',
      name: t('ecosystem_hr'),
      description: t('ecosystem_hr_desc'),
      isKey: false,
      icon: '👥',
      color: '#F59E0B',
      details: {
        title: t('modal_hr_title'),
        description: t('modal_hr_description'),
        features: t('modal_hr_features').split(','),
        screenshot: '/api/placeholder/600/400'
      }
    }
  ];

  const selectedModuleData = modules.find(m => m.id === selectedModule) || modules[2]!;

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

  const moduleListVariants = {
    hidden: { 
      opacity: 0, 
      x: -50
    },
    visible: { 
      opacity: 1, 
      x: 0
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      x: 50
    },
    visible: { 
      opacity: 1, 
      x: 0
    }
  };

  const isRTL = (text: string) => {
    // Simple RTL detection based on Persian characters
    return /[\u0600-\u06FF]/.test(text);
  };

  return (
    <section className="relative min-h-screen bg-transparent overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Section title */}
        <motion.div 
          className="text-center py-16"
          variants={titleVariants}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6">
            {t('ecosystem_title')}
          </h2>
        </motion.div>

        {/* Responsive layout - Desktop: Side by side, Mobile: Accordion */}
        {isMobile ? (
          /* Mobile Accordion Layout */
          <div className="space-y-4">
            {modules.map((module) => (
              <motion.div
                key={module.id}
                className="relative"
                variants={moduleListVariants}
              >
                <motion.div
                  className={`
                    relative cursor-pointer group rounded-2xl border transition-all duration-500
                    ${expandedModule === module.id 
                      ? 'bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] border-[#E000A0]/50 shadow-lg shadow-[#E000A0]/10' 
                      : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#E000A0]/30'
                    }
                  `}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                >
                  {/* Key module badge */}
                  {module.isKey && (
                    <div className="absolute -top-2 -end-2 bg-gradient-to-r from-[#E000A0] to-[#B8008A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {t('ecosystem_instapulse_badge')}
                    </div>
                  )}

                  {/* Module header - always visible */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${module.color}20` }}
                        >
                          {module.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold ${
                            expandedModule === module.id ? 'text-[#E000A0]' : 'text-[#F5F5F5]'
                          } ${
                            isRTL(module.name) ? 'text-end' : 'text-start'
                          }`}>
                            {module.name}
                          </h3>
                          <p className={`text-sm text-[#A1A1A1] mt-1 ${
                            isRTL(module.description) ? 'text-end' : 'text-start'
                          }`}>
                            {module.description}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedModule === module.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-[#A1A1A1]"
                      >
                        ▼
                      </motion.div>
                    </div>
                  </div>

                  {/* Expandable content */}
                  <AnimatePresence>
                    {expandedModule === module.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 border-t border-[#2A2A2A]">
                          {/* Module details */}
                          <div className="pt-6">
                            <h4 className={`text-lg font-semibold text-[#F5F5F5] mb-4 ${
                              isRTL(module.details.title) ? 'text-end' : 'text-start'
                            }`}>
                              {module.details.title}
                            </h4>
                            
                            <p className={`text-[#A1A1A1] leading-relaxed mb-6 ${
                              isRTL(module.details.description) ? 'text-end' : 'text-start'
                            }`}>
                              {module.details.description}
                            </p>

                            {/* Features list */}
                            <div className="mb-6">
                              <h5 className={`text-base font-semibold text-[#F5F5F5] mb-3 ${
                                isRTL('Features') ? 'text-end' : 'text-start'
                              }`}>
                                Key Features
                              </h5>
                              <div className="space-y-2">
                                {module.details.features.map((feature, featureIndex) => (
                                  <motion.div
                                    key={featureIndex}
                                    className="flex items-center space-x-3 rtl:space-x-reverse"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: featureIndex * 0.1 }}
                                  >
                                    <div 
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: module.color }}
                                    />
                                    <span className={`text-sm text-[#A1A1A1] ${
                                      isRTL(feature) ? 'text-end' : 'text-start'
                                    }`}>
                                      {feature.trim()}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Screenshot placeholder */}
                            <div className="relative bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A] overflow-hidden">
                              <div className="aspect-video bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] flex items-center justify-center">
                                <div className="text-center">
                                  <div 
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                                    style={{ backgroundColor: `${module.color}20` }}
                                  >
                                    {module.icon}
                                  </div>
                                  <p className="text-[#666666] text-xs">
                                    {module.details.title} Screenshot
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Desktop Side-by-Side Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[80vh]">
            {/* Left side - Module list */}
            <motion.div 
              className="space-y-4"
              variants={moduleListVariants}
            >
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  className={`relative cursor-pointer group ${
                    selectedModule === module.id ? 'z-10' : ''
                  }`}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedModule(module.id)}
                >
                  <div className={`
                    relative p-6 rounded-2xl border transition-all duration-500
                    ${selectedModule === module.id 
                      ? 'bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] border-[#E000A0]/50 shadow-lg shadow-[#E000A0]/10' 
                      : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#E000A0]/30'
                    }
                  `}>
                    {/* Key module badge */}
                    {module.isKey && (
                      <div className="absolute -top-2 -end-2 bg-gradient-to-r from-[#E000A0] to-[#B8008A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {t('ecosystem_instapulse_badge')}
                      </div>
                    )}

                    {/* Module icon and name */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${module.color}20` }}
                      >
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold ${
                          selectedModule === module.id ? 'text-[#E000A0]' : 'text-[#F5F5F5]'
                        } ${
                          isRTL(module.name) ? 'text-end' : 'text-start'
                        }`}>
                          {module.name}
                        </h3>
                        <p className={`text-sm text-[#A1A1A1] mt-1 ${
                          isRTL(module.description) ? 'text-end' : 'text-start'
                        }`}>
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right side - Module details */}
            <motion.div 
              className="relative"
              variants={contentVariants}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedModule}
                  className="relative h-full bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-3xl border border-[#2A2A2A] overflow-hidden"
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {/* Module header */}
                  <div className="p-8 border-b border-[#2A2A2A]">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ backgroundColor: `${selectedModuleData.color}20` }}
                      >
                        {selectedModuleData.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold text-[#F5F5F5] ${
                          isRTL(selectedModuleData.details.title) ? 'text-end' : 'text-start'
                        }`}>
                          {selectedModuleData.details.title}
                          {selectedModuleData.isKey && (
                            <span className="ms-3 text-sm bg-gradient-to-r from-[#E000A0] to-[#B8008A] text-white px-3 py-1 rounded-full">
                              {t('ecosystem_instapulse_badge')}
                            </span>
                          )}
                        </h3>
                      </div>
                    </div>
                    
                    <p className={`text-[#A1A1A1] leading-relaxed ${
                      isRTL(selectedModuleData.details.description) ? 'text-end' : 'text-start'
                    }`}>
                      {selectedModuleData.details.description}
                    </p>
                  </div>

                  {/* Features list */}
                  <div className="p-8">
                    <h4 className={`text-lg font-semibold text-[#F5F5F5] mb-4 ${
                      isRTL('Features') ? 'text-end' : 'text-start'
                    }`}>
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedModuleData.details.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          className="flex items-center space-x-3 rtl:space-x-reverse"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: selectedModuleData.color }}
                          />
                          <span className={`text-sm text-[#A1A1A1] ${
                            isRTL(feature) ? 'text-end' : 'text-start'
                          }`}>
                            {feature.trim()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Screenshot placeholder */}
                  <div className="p-8 pt-0">
                    <div className="relative bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A] overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] flex items-center justify-center">
                        <div className="text-center">
                          <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                            style={{ backgroundColor: `${selectedModuleData.color}20` }}
                          >
                            {selectedModuleData.icon}
                          </div>
                          <p className="text-[#666666] text-sm">
                            {selectedModuleData.details.title} Screenshot
                          </p>
                        </div>
                      </div>
                      
                      {/* Subtle animation overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E000A0]/5 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>

                  {/* Subtle glow effect */}
                  <div 
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${selectedModuleData.color}10 0%, transparent 70%)`
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Bottom transition */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-[#E000A0]"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm font-medium">Explore the ecosystem</span>
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