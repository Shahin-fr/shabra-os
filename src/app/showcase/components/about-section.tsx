'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from '../../../hooks/useMediaQuery';

/**
 * AboutSection Component - Completely Re-architected
 * 
 * A clean, professional about section with centered title,
 * developer bio, and interactive social media links.
 */
export default function AboutSection() {
  const isMobile = useIsMobile();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Social media links
  const socialLinks = [
    { name: 'GitHub', icon: '🐙', url: '#', color: '#333333' },
    { name: 'LinkedIn', icon: '💼', url: '#', color: '#0077B5' },
    { name: 'Twitter', icon: '🐦', url: '#', color: '#1DA1F2' },
    { name: 'Email', icon: '📧', url: '#', color: '#EA4335' },
    { name: 'Portfolio', icon: '🌐', url: '#', color: '#8B5CF6' }
  ];

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
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const socialItemVariants = {
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
        className="max-w-4xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Section Title */}
        <motion.div 
          className="mb-16"
          variants={itemVariants}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6">
            درباره توسعه‌دهنده
          </h2>
          <p className="text-lg sm:text-xl text-[#A1A1A1] max-w-3xl mx-auto leading-relaxed">
            با من آشنا شوید و از تجربه‌ها و مهارت‌هایم در توسعه نرم‌افزار مطلع شوید
          </p>
        </motion.div>

        {/* Developer Bio */}
        <motion.div 
          className="mb-12"
          variants={itemVariants}
        >
          <div className={`bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-3xl border border-[#2A2A2A] ${isMobile ? 'p-6' : 'p-8 sm:p-12'} shadow-2xl`}>
            {/* Profile Image Placeholder */}
            <motion.div 
              className={`${isMobile ? 'w-20 h-20 mb-4' : 'w-24 h-24 mb-6'} bg-gradient-to-br from-[#E000A0] to-[#B8008A] rounded-full mx-auto flex items-center justify-center`}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>S</span>
            </motion.div>

            {/* Bio Text */}
            <div className={`space-y-${isMobile ? '4' : '6'}`}>
              <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[#F5F5F5] ${isMobile ? 'mb-3' : 'mb-4'}`}>
                سلام، من شابرا هستم
              </h3>
              
              <p className={`text-[#A1A1A1] leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
                یک توسعه‌دهنده فول‌استک با بیش از ۵ سال تجربه در ایجاد نرم‌افزارهای مدرن و کاربردی. 
                من عاشق حل مسائل پیچیده و ایجاد تجربه‌های دیجیتال بی‌نظیر هستم.
              </p>
              
              <p className={`text-[#A1A1A1] leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
                پروژه شابرا OS نتیجه سال‌ها تحقیق، طراحی و توسعه است که با هدف ساده‌سازی 
                و یکپارچه‌سازی ابزارهای مختلف کاری ایجاد شده است.
              </p>

              {/* Skills */}
              <div className={`flex flex-wrap justify-center gap-2 ${isMobile ? 'mt-6' : 'mt-8'}`}>
                {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'UI/UX Design', 'DevOps'].map((skill) => (
                  <motion.span
                    key={skill}
                    className={`${isMobile ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} bg-[#E000A0]/10 text-[#E000A0] rounded-full font-medium border border-[#E000A0]/20`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Media Links */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-[#F5F5F5] mb-6">
            با من در ارتباط باشید
          </h3>
          
          <motion.div 
            className={`flex flex-wrap justify-center ${isMobile ? 'gap-3' : 'gap-4'}`}
            variants={containerVariants}
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.url}
                className="group"
                variants={socialItemVariants}
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className={`flex items-center ${isMobile ? 'space-x-2 rtl:space-x-reverse px-4 py-2' : 'space-x-3 rtl:space-x-reverse px-6 py-3'} rtl:space-x-reverse bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] hover:border-[#E000A0]/50 transition-all duration-300 cursor-pointer group-hover:shadow-lg group-hover:shadow-[#E000A0]/10`}
                  style={{ borderColor: `${social.color}20` }}
                >
                  <span className={`${isMobile ? 'text-lg' : 'text-xl'} group-hover:scale-110 transition-transform duration-300`}>
                    {social.icon}
                  </span>
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} text-[#F5F5F5] group-hover:text-[#E000A0] transition-colors duration-300 font-medium`}>
                    {social.name}
                  </span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-12"
          variants={itemVariants}
        >
          <motion.a
            href="mailto:contact@shabra.dev"
            className={`inline-flex items-center gap-2 ${isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-4 text-base'} bg-gradient-to-r from-[#E000A0] to-[#B8008A] text-white font-semibold rounded-xl shadow-lg shadow-[#E000A0]/25 hover:shadow-[#E000A0]/40 transition-all duration-300`}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(224, 0, 160, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            شروع همکاری
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.a>
        </motion.div>

        {/* Subtle background decoration */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 0.03 : 0 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-1/3 start-1/3 w-96 h-96 bg-[#E000A0] rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 end-1/3 w-64 h-64 bg-[#8B5CF6] rounded-full blur-3xl" />
        </motion.div>
      </motion.div>
    </section>
  );
}