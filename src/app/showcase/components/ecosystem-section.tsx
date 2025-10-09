"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { t } from '../utils/i18n';
import { LayoutGrid, Clapperboard, Zap, BookOpen, Users } from 'lucide-react';
import Image from 'next/image';

/**
 * EcosystemSection Component - Completely Re-architected
 * 
 * A full-screen, highly interactive experience showcasing
 * the modular ecosystem with seamless transitions and RTL/LTR support.
 */
export default function EcosystemSection() {
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
      icon: LayoutGrid,
      color: '#3B82F6',
      details: {
        title: t('modal_task_management_title'),
        description: t('modal_task_management_description'),
        features: t('modal_task_management_features').split(','),
        screenshot: '/images/task-management.gif'
      }
    },
    {
      id: 'storyboard',
      name: t('ecosystem_storyboard'),
      description: t('ecosystem_storyboard_desc'),
      isKey: false,
      icon: Clapperboard,
      color: '#8B5CF6',
      details: {
        title: t('modal_storyboard_title'),
        description: t('modal_storyboard_description'),
        features: t('modal_storyboard_features').split(','),
        screenshot: '/images/storyboard.gif'
      }
    },
    {
      id: 'instapulse',
      name: t('ecosystem_instapulse'),
      description: t('ecosystem_instapulse_desc'),
      isKey: true,
      icon: Zap,
      color: '#E000A0',
      details: {
        title: t('modal_instapulse_title'),
        description: t('modal_instapulse_description'),
        features: t('modal_instapulse_features').split(','),
        screenshot: '/images/instapulse.gif'
      }
    },
    {
      id: 'wiki',
      name: t('ecosystem_wiki'),
      description: t('ecosystem_wiki_desc'),
      isKey: false,
      icon: BookOpen,
      color: '#10B981',
      details: {
        title: t('modal_wiki_title'),
        description: t('modal_wiki_description'),
        features: t('modal_wiki_features').split(','),
        screenshot: '/images/wiki.gif'
      }
    },
    {
      id: 'hr',
      name: t('ecosystem_hr'),
      description: t('ecosystem_hr_desc'),
      isKey: false,
      icon: Users,
      color: '#F59E0B',
      details: {
        title: t('modal_hr_title'),
        description: t('modal_hr_description'),
        features: t('modal_hr_features').split(','),
        screenshot: '/images/hr.gif'
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

  /*
  const renderMixedText = (text: string) => {
    // Check if text contains both Persian and English
    const hasPersian = /[\u0600-\u06FF]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    
    if (hasPersian && hasEnglish) {
      // More sophisticated splitting to handle mixed content
      const parts = text.split(/([a-zA-Z\s\-\(\)]+)/).filter(part => part.trim());
      const persianParts = parts.filter(part => /[\u0600-\u06FF]/.test(part)).join(' ');
      const englishParts = parts.filter(part => /[a-zA-Z]/.test(part)).join(' ');
      
      return { persian: persianParts, english: englishParts, isMixed: true };
    }
    
    // For pure Persian or pure English text
    return { persian: text, english: '', isMixed: false };
  };
  */

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
          <p className="text-lg sm:text-xl text-[#A1A1A1] max-w-4xl mx-auto leading-relaxed mb-16">
            شبرا OS مجموعه‌ای از ماژول‌های متصل به همه. هر کدوم از این‌ها به عنوان پاسخی به یک نیاز مشخص شروع شد و در کنار هم، اساس اون چشم‌انداز بزرگتر رو تشکیل می‌دن.
          </p>
        </motion.div>

        {/* Responsive layout - Desktop: Side by side, Mobile: Accordion */}
        {/* eslint-disable-next-line no-constant-condition */}
        {false ? (
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

                  {/* هدر ماژول - همیشه قابل مشاهده */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${module.color}20` }}
                        >
                          <module.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold ${
                            expandedModule === module.id ? 'text-[#E000A0]' : 'text-[#F5F5F5]'
                          } text-right`} dir="rtl">
                            {module.name}
                          </h3>
                          <p className="text-sm text-[#A1A1A1] mt-1 text-right" dir="rtl">
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

                  {/* محتوای قابل گسترش */}
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
                          {/* جزئیات ماژول */}
                          <div className="pt-6">
                            <h4 className={`text-lg font-semibold text-[#F5F5F5] mb-4 ${
                              isRTL(module.details.title) ? 'text-end' : 'text-start'
                            }`}>
                              {module.details.title}
                            </h4>
                            
                            <p className="text-[#A1A1A1] leading-relaxed mb-6 text-right" dir="rtl">
                              {module.details.description}
                            </p>

                            {/* لیست ویژگی‌ها */}
                            <div className="mb-6">
                              <h5 className={`text-base font-semibold text-[#F5F5F5] mb-3 ${
                                isRTL('ویژگی‌های کلیدی') ? 'text-end' : 'text-start'
                              }`}>
                                ویژگی‌های کلیدی
                              </h5>
                              <ul className="space-y-2">
                                {module.details.features.map((feature, featureIndex) => (
                                  <motion.li
                                    key={featureIndex}
                                    className="flex items-center justify-between w-full"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: featureIndex * 0.1 }}
                                  >
                                    <span className="text-right text-gray-300">
                                      <span className="ml-2">•</span>
                                      {feature.trim()}
                                    </span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>

                            {/* تصویر ماژول */}
                            <div className="relative bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A] overflow-hidden">
                              <div className="w-full h-64 flex items-center justify-center p-4 relative">
                                {/* Display actual image if available, otherwise show placeholder */}
                                {module.details.screenshot ? (
                                  <div className="relative w-full h-full">
                            <Image 
                              src={module.details.screenshot}
                              alt={`نمایی از ${module.details.title}`}
                              fill
                              className="object-cover rounded-xl"
                              unoptimized={true}
                                      onError={(e) => {
                                        console.log('Image error:', module.details.screenshot);
                                        e.currentTarget.style.display = 'none';
                                        // Show fallback content
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'block';
                                      }}
                                      onLoad={() => console.log('Image loaded:', module.details.screenshot)}
                                    />
                                    {/* Fallback content - hidden by default */}
                                    <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                                      <div className="text-center">
                                        <div 
                                          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                          style={{ backgroundColor: module.color }}
                                        >
                                          <module.icon size={32} style={{ color: "#FFFFFF" }} />
                                        </div>
                                        <p className="text-[#666666] text-sm text-right" dir="rtl">
                                          نمایی از {module.details.title}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <div 
                                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                      style={{ backgroundColor: module.color }}
                                    >
                                      <module.icon size={32} style={{ color: "#FFFFFF" }} />
                                    </div>
                                    <p className="text-[#666666] text-sm text-right" dir="rtl">
                                      نمایی از {module.details.title}
                                    </p>
                                  </div>
                                )}
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
          /* Desktop Grid Layout */
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

                    {/* Module icon and name */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: module.color }}
                      >
                        <module.icon size={20} style={{ color: "#FFFFFF" }} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold ${
                          selectedModule === module.id ? 'text-[#E000A0]' : 'text-[#F5F5F5]'
                        } text-right`} dir="rtl">
                          {module.name}
                        </h3>
                        <p className="text-sm text-[#A1A1A1] mt-1 text-right" dir="rtl">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* سمت راست - جزئیات ماژول */}
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
                  {/* هدر ماژول */}
                  <div className="p-8 border-b border-[#2A2A2A]">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: selectedModuleData.color }}
                      >
                        <selectedModuleData.icon size={32} style={{ color: "#FFFFFF" }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-right text-white" dir="rtl">
                          {selectedModuleData.details.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-gray-300 text-right" dir="rtl">
                      {selectedModuleData.details.description}
                    </p>
                  </div>

                  {/* لیست ویژگی‌ها */}
                  <div className="p-8">
                    <div className="mt-8">
                      <h4 className="text-xl font-semibold text-right text-white" dir="rtl">ویژگی‌های کلیدی</h4>
                      <ul className="mt-4 space-y-2">
                        {selectedModuleData.details.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            className="flex items-center justify-between w-full"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: featureIndex * 0.1 }}
                          >
                            <span className="text-right text-gray-300">
                              <span className="ml-2">•</span>
                              {feature.trim()}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* جایگاه تصویر */}
                  <div className="p-8 pt-0">
                    <div className="relative bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A] overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] flex items-center justify-center relative">
                        {/* Display actual image if available, otherwise show placeholder */}
                        {selectedModuleData.details.screenshot ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={selectedModuleData.details.screenshot}
                              alt={`نمایی از ${selectedModuleData.details.title}`}
                              fill
                              className="object-cover rounded-xl"
                              unoptimized={true}
                              onError={(e) => {
                                console.log('Image error:', selectedModuleData.details.screenshot);
                                e.currentTarget.style.display = 'none';
                                // Show fallback content
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                              }}
                              onLoad={() => console.log('Image loaded:', selectedModuleData.details.screenshot)}
                            />
                            {/* Fallback content - hidden by default */}
                            <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                              <div className="text-center">
                                <div 
                                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                  style={{ backgroundColor: selectedModuleData.color }}
                                >
                                  <selectedModuleData.icon size={32} style={{ color: "#FFFFFF" }} />
                                </div>
                                <p className="text-[#666666] text-sm text-right" dir="rtl">
                                  نمایی از {selectedModuleData.details.title}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div 
                              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                              style={{ backgroundColor: selectedModuleData.color }}
                            >
                              <selectedModuleData.icon size={32} style={{ color: "#FFFFFF" }} />
                            </div>
                            <p className="text-[#666666] text-sm text-right" dir="rtl">
                              نمایی از {selectedModuleData.details.title}
                            </p>
                          </div>
                        )}
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

      </motion.div>
    </section>
  );
}