"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { t } from '../utils/i18n';

/**
 * RoadmapSection Component - Perfectly Synchronized Scroll Timeline
 * 
 * A clean, elegant timeline where scroll progress drives milestone animations.
 * The journey: scroll progress bar fills the track, triggering beautiful
 * circle animations at each milestone with perfect synchronization.
 */
export default function RoadmapSection() {
  const isMobile = useIsMobile();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sectionRef = React.useRef<HTMLDivElement>(null);


  // Main scroll progress with better offset for smoother tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const phases = [
    {
      title: t('roadmap_phase1_title'),
      description: t('roadmap_phase1_desc'),
      status: 'current',
      features: t('roadmap_phase1_features').split(','),
      color: '#E000A0',
      icon: '🚀'
    },
    {
      title: t('roadmap_phase2_title'),
      description: t('roadmap_phase2_desc'),
      status: 'upcoming',
      features: t('roadmap_phase2_features').split(','),
      color: '#3B82F6',
      icon: '⚡'
    },
    {
      title: t('roadmap_phase3_title'),
      description: t('roadmap_phase3_desc'),
      status: 'future',
      features: t('roadmap_phase3_features').split(','),
      color: '#8B5CF6',
      icon: '🌐'
    }
  ];

  // Precise milestone trigger points with smooth transitions
  // Milestone 1 at ~20% of section height
  const milestone1Progress = useTransform(scrollYProgress, [0.15, 0.25], [0, 1]);
  const milestone1Fill = useTransform(milestone1Progress, [0.3, 1], [0, 1]);
  const milestone1Scale = useTransform(milestone1Progress, [0.2, 0.5, 0.8], [1, 1.15, 1]);
  const milestone1Glow = useTransform(milestone1Progress, [0.4, 0.8], [0, 1]);
  const card1Visible = useTransform(milestone1Progress, [0.2, 0.6], [0, 1]);

  // Milestone 2 at ~50% of section height
  const milestone2Progress = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const milestone2Fill = useTransform(milestone2Progress, [0.3, 1], [0, 1]);
  const milestone2Scale = useTransform(milestone2Progress, [0.2, 0.5, 0.8], [1, 1.15, 1]);
  const milestone2Glow = useTransform(milestone2Progress, [0.4, 0.8], [0, 1]);
  const card2Visible = useTransform(milestone2Progress, [0.2, 0.6], [0, 1]);

  // Milestone 3 at ~80% of section height
  const milestone3Progress = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const milestone3Fill = useTransform(milestone3Progress, [0.3, 1], [0, 1]);
  const milestone3Scale = useTransform(milestone3Progress, [0.2, 0.5, 0.8], [1, 1.15, 1]);
  const milestone3Glow = useTransform(milestone3Progress, [0.4, 0.8], [0, 1]);
  const card3Visible = useTransform(milestone3Progress, [0.2, 0.6], [0, 1]);

  const isRTL = (text: string) => {
    return /[\u0600-\u06FF]/.test(text);
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden"
    >
      <motion.div 
        ref={containerRef}
        className="max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Section title */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6">
            {t('roadmap_title')}
          </h2>
          <p className="text-lg text-[#A1A1A1] max-w-3xl mx-auto">
            طراحی این چشم‌انداز، تمرینی برای تفکر استراتژیک و درک مسیر پیچیده تبدیل یک ایده به یک محصول در کلاس جهانی بود.
          </p>
        </motion.div>

        {/* Scroll-Driven Timeline */}
        <div className="relative min-h-[800px]">
          {/* Central Track Line - Simple and clean with rounded ends */}
          <div className={`absolute w-1 h-full bg-[#2A2A2A] rounded-full ${
            isMobile ? 'start-8' : 'start-1/2 transform -translate-x-1/2'
          }`} 
          style={{
            borderRadius: '0.5rem'
          }} />
          
          {/* Progress Bar - Perfectly aligned with rounded ends */}
          <motion.div
            className={`absolute w-1 h-full rounded-full ${
              isMobile ? 'start-8' : 'start-1/2'
            }`}
            style={{
              scaleY: scrollYProgress,
              background: 'linear-gradient(to bottom, #E000A0, #3B82F6, #8B5CF6)',
              borderRadius: '0.5rem',
              transformOrigin: 'top',
              transform: 'translateX(-50%)'
            }}
          />

          {/* Milestone Circles with Perfect Synchronization */}
          <div className="space-y-32">
            {/* Milestone 1 - Positioned at ~20% */}
            <div className={`relative flex items-center ${isMobile ? 'justify-start rtl:justify-start' : 'justify-center'}`}>
              <div className={`absolute z-20 ${
                isMobile ? 'start-6' : 'start-1/2 transform -translate-x-1/2'
              }`}>
                <motion.div
                  className={`rounded-full border-4 border-[#E000A0] bg-[#1A1A1A] flex items-center justify-center shadow-lg relative overflow-hidden ${
                    isMobile ? 'w-12 h-12 text-xl' : 'w-16 h-16 text-2xl'
                  }`}
                  style={{
                    scale: milestone1Scale,
                    boxShadow: useTransform(milestone1Glow, [0, 1], [
                      '0 0 0px rgba(224, 0, 160, 0)',
                      '0 0 20px rgba(224, 0, 160, 0.6), 0 0 40px rgba(224, 0, 160, 0.3)'
                    ])
                  }}
                >
                  {/* Animated background fill */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: useTransform(milestone1Fill, [0, 1], [
                        'transparent',
                        'linear-gradient(135deg, #E000A0, #FF1493)'
                      ]),
                      opacity: useTransform(milestone1Fill, [0, 0.3, 1], [0, 0, 0.9])
                    }}
                  />
                  
                  {/* Pulsing ring effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#E000A0]"
                    style={{
                      scale: useTransform(milestone1Fill, [0, 1], [1, 1.2]),
                      opacity: useTransform(milestone1Fill, [0, 0.5, 1], [0, 0.6, 0])
                    }}
                  />
                  
                  {/* Icon with smooth color transition */}
                  <motion.div 
                    className="relative z-10"
                    style={{
                      filter: useTransform(milestone1Fill, [0, 1], [
                        'brightness(1)',
                        'brightness(1.2) drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
                      ])
                    }}
                  >
                    {phases[0]?.icon}
                  </motion.div>
                </motion.div>
              </div>

              {/* Card 1 */}
              <motion.div
                className={`${isMobile ? 'w-full ms-20' : 'w-5/12 ms-auto ps-8'}`}
                style={{
                  opacity: card1Visible,
                  y: useTransform(card1Visible, [0, 1], [30, 0]),
                  scale: useTransform(card1Visible, [0, 1], [0.95, 1]),
                  rotateY: useTransform(card1Visible, [0, 1], [15, 0])
                }}
              >
                <div className={`bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 backdrop-blur-xl rounded-3xl border border-[#2A2A2A]/50 shadow-2xl ${
                  isMobile ? 'p-6' : 'p-8'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-[#E000A0] border-[#E000A0] bg-[#E000A0]/10">
                      Current Phase
                    </div>
                    <span className="text-sm text-gray-400">(v1.0 - v2.0)</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#F5F5F5] mb-4 text-left" dir="ltr">
                    {phases[0]?.title}
                  </h3>
                  <p className="text-[#A1A1A1] mb-6 leading-relaxed text-right" dir="rtl">
                    {phases[0]?.description}
                  </p>
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-[#F5F5F5] text-left" dir="ltr">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {phases[0]?.features?.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start rtl:items-start space-x-3 rtl:space-x-reverse">
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2 bg-[#E000A0]" />
                          <span className="text-sm text-[#A1A1A1] text-left" dir="ltr">
                            {feature?.trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Milestone 2 - Positioned at ~50% */}
            <div className={`relative flex items-center ${isMobile ? 'justify-start rtl:justify-start' : 'justify-center'}`}>
              <div className={`absolute z-20 ${
                isMobile ? 'start-6' : 'start-1/2 transform -translate-x-1/2'
              }`}>
                <motion.div
                  className={`rounded-full border-4 border-[#3B82F6] bg-[#1A1A1A] flex items-center justify-center shadow-lg relative overflow-hidden ${
                    isMobile ? 'w-12 h-12 text-xl' : 'w-16 h-16 text-2xl'
                  }`}
                  style={{
                    scale: milestone2Scale,
                    boxShadow: useTransform(milestone2Glow, [0, 1], [
                      '0 0 0px rgba(59, 130, 246, 0)',
                      '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)'
                    ])
                  }}
                >
                  {/* Animated background fill */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: useTransform(milestone2Fill, [0, 1], [
                        'transparent',
                        'linear-gradient(135deg, #3B82F6, #60A5FA)'
                      ]),
                      opacity: useTransform(milestone2Fill, [0, 0.3, 1], [0, 0, 0.9])
                    }}
                  />
                  
                  {/* Pulsing ring effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#3B82F6]"
                    style={{
                      scale: useTransform(milestone2Fill, [0, 1], [1, 1.2]),
                      opacity: useTransform(milestone2Fill, [0, 0.5, 1], [0, 0.6, 0])
                    }}
                  />
                  
                  {/* Icon with smooth color transition */}
                  <motion.div 
                    className="relative z-10"
                    style={{
                      filter: useTransform(milestone2Fill, [0, 1], [
                        'brightness(1)',
                        'brightness(1.2) drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
                      ])
                    }}
                  >
                    {phases[1]?.icon}
                  </motion.div>
                </motion.div>
              </div>

              {/* Card 2 */}
              <motion.div
                className={`${isMobile ? 'w-full ms-20' : 'w-5/12 me-auto pe-8'}`}
                style={{
                  opacity: card2Visible,
                  y: useTransform(card2Visible, [0, 1], [30, 0]),
                  scale: useTransform(card2Visible, [0, 1], [0.95, 1]),
                  rotateY: useTransform(card2Visible, [0, 1], [-15, 0])
                }}
              >
                <div className={`bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 backdrop-blur-xl rounded-3xl border border-[#2A2A2A]/50 shadow-2xl ${
                  isMobile ? 'p-6' : 'p-8'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-[#3B82F6] border-[#3B82F6] bg-[#3B82F6]/10">
                      Upcoming
                    </div>
                    <span className="text-sm text-gray-400">(v2.0 - v3.0)</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#F5F5F5] mb-4 text-left" dir="ltr">
                    {phases[1]?.title}
                  </h3>
                  <p className="text-[#A1A1A1] mb-6 leading-relaxed text-right" dir="rtl">
                    {phases[1]?.description}
                  </p>
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-[#F5F5F5] text-left" dir="ltr">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {phases[1]?.features?.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start rtl:items-start space-x-3 rtl:space-x-reverse">
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2 bg-[#3B82F6]" />
                          <span className="text-sm text-[#A1A1A1] text-left" dir="ltr">
                            {feature?.trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Milestone 3 - Positioned at ~80% */}
            <div className={`relative flex items-center ${isMobile ? 'justify-start rtl:justify-start' : 'justify-center'}`}>
              <div className={`absolute z-20 ${
                isMobile ? 'start-6' : 'start-1/2 transform -translate-x-1/2'
              }`}>
                <motion.div
                  className={`rounded-full border-4 border-[#8B5CF6] bg-[#1A1A1A] flex items-center justify-center shadow-lg relative overflow-hidden ${
                    isMobile ? 'w-12 h-12 text-xl' : 'w-16 h-16 text-2xl'
                  }`}
                  style={{
                    scale: milestone3Scale,
                    boxShadow: useTransform(milestone3Glow, [0, 1], [
                      '0 0 0px rgba(139, 92, 246, 0)',
                      '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)'
                    ])
                  }}
                >
                  {/* Animated background fill */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: useTransform(milestone3Fill, [0, 1], [
                        'transparent',
                        'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                      ]),
                      opacity: useTransform(milestone3Fill, [0, 0.3, 1], [0, 0, 0.9])
                    }}
                  />
                  
                  {/* Pulsing ring effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#8B5CF6]"
                    style={{
                      scale: useTransform(milestone3Fill, [0, 1], [1, 1.2]),
                      opacity: useTransform(milestone3Fill, [0, 0.5, 1], [0, 0.6, 0])
                    }}
                  />
                  
                  {/* Icon with smooth color transition */}
                  <motion.div 
                    className="relative z-10"
                    style={{
                      filter: useTransform(milestone3Fill, [0, 1], [
                        'brightness(1)',
                        'brightness(1.2) drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
                      ])
                    }}
                  >
                    {phases[2]?.icon}
                  </motion.div>
                </motion.div>
              </div>

              {/* Card 3 */}
              <motion.div
                className={`${isMobile ? 'w-full ms-20' : 'w-5/12 ms-auto ps-8'}`}
                style={{
                  opacity: card3Visible,
                  y: useTransform(card3Visible, [0, 1], [30, 0]),
                  scale: useTransform(card3Visible, [0, 1], [0.95, 1]),
                  rotateY: useTransform(card3Visible, [0, 1], [15, 0])
                }}
              >
                <div className={`bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 backdrop-blur-xl rounded-3xl border border-[#2A2A2A]/50 shadow-2xl ${
                  isMobile ? 'p-6' : 'p-8'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-[#8B5CF6] border-[#8B5CF6] bg-[#8B5CF6]/10">
                      Future Vision
                    </div>
                    <span className="text-sm text-gray-400">(v3.0+)</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#F5F5F5] mb-4 text-left" dir="ltr">
                    {phases[2]?.title}
                  </h3>
                  <p className="text-[#A1A1A1] mb-6 leading-relaxed text-right" dir="rtl">
                    {phases[2]?.description}
                  </p>
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-[#F5F5F5] text-left" dir="ltr">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {phases[2]?.features?.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start rtl:items-start space-x-3 rtl:space-x-reverse">
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2 bg-[#8B5CF6]" />
                          <span className="text-sm text-[#A1A1A1] text-left" dir="ltr">
                            {feature?.trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

      </motion.div>
    </section>
  );
}