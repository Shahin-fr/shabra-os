"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  siSlack,
  siAsana,
  siTrello,
  siNotion,
  siObsidian,
  siJira,
  siMiro,
  siFigma,
  siGooglecalendar,
  siGoogledrive,
  siDropbox,
  siWhatsapp,
  siTelegram,
  siDiscord,
  siZoom,
  siCanva,
  siSketch,
  siInvision,
  siZapier,
  siAirtable,
  siClickup,
  siGooglemeet,
  siGmail
} from 'simple-icons/icons';

// Type definitions
interface WaterfallElement {
  id: string;
  type: 'brand' | 'abstract';
  name?: string;
  icon?: any; // simple-icons icon object
  color: string;
  size: number;
  shape?: string;
  leftPosition: number;
  duration: number;
  delay: number;
  opacity: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEdgeColumn?: boolean; // For lens effect
}

// ClientOnly wrapper to prevent hydration errors
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

/**
 * ProblemSection Component - Icon Waterfall
 * 
 * A beautiful, calm waterfall of tool icons representing the scattered tools
 * before Shabra OS. Icons drift down continuously, creating a mesmerizing effect.
 */
export default function ProblemSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const [waterfallElements, setWaterfallElements] = useState<WaterfallElement[]>([]);

  // Extensive curated brand icons - 24 unique icons for maximum variety
  const baseIcons = [
    siSlack,
    siAsana,
    siTrello,
    siNotion,
    siObsidian,
    siJira,
    siMiro,
    siFigma,
    siGooglecalendar,
    siGoogledrive,
    siDropbox,
    siWhatsapp,
    siTelegram,
    siDiscord,
    siZoom,
    siCanva,
    siSketch,
    siInvision,
    siZapier,
    siAirtable,
    siClickup,
    siGooglemeet,
    siGmail
  ];

  // Create 40-45 total icons with minimal repetition
  const brandIcons = [
    ...baseIcons,
    // Duplicate most popular tools for better visual density
    siSlack,
    siTrello,
    siNotion,
    siFigma,
    siDiscord,
    siZoom,
    siMiro,
    siAsana,
    siWhatsapp,
    siJira,
    siGooglecalendar,
    siCanva,
    siAirtable,
    siZapier
  ];

  // Dark icons that need color override for visibility
  const darkIcons = ['Notion', 'GitHub', 'GitLab', 'Vercel', 'Docker', 'Postman', 'React', 'Node.js', 'TypeScript'];

  // No abstract shapes - only brand icons for cleaner storytelling

  // Generate waterfall elements with two-tiered delay system for instant start
  useEffect(() => {
    const elements: WaterfallElement[] = [];
    const usedPositions: number[] = [];
    const minDistance = 80; // Reduced for more density with lens effect
    
    // Create 42 elements for the waterfall - maximum variety
    for (let i = 0; i < 42; i++) {
      // Find a position that doesn't collide with existing elements
      let leftPosition = Math.random() * 100;
      let attempts = 0;
      while (attempts < 40) {
        const tooClose = usedPositions.some(pos => Math.abs(pos - leftPosition) < minDistance);
        if (!tooClose) break;
        leftPosition = Math.random() * 100;
        attempts++;
      }
      usedPositions.push(leftPosition);
      
      const brand = brandIcons[Math.floor(Math.random() * brandIcons.length)];
      if (brand) {
        // Determine if icon is in edge columns (lens effect)
        const isEdgeColumn = leftPosition < 20 || leftPosition > 80;
        
        // Two-tiered delay system for instant animation start
        const isFirstWave = i < Math.floor(42 * 0.4); // First 40% of icons (17 icons)
        const delay = isFirstWave 
          ? Math.random() * 2 // First wave: 0-2 seconds (instant start)
          : Math.random() * 18 + 2; // Main flow: 2-20 seconds (continuous flow)
        
        elements.push({
          id: `brand-${i}-${Date.now()}`,
          type: 'brand',
          name: brand.title,
          icon: brand,
          color: `#${brand.hex}`,
          size: Math.random() * 20 + 20, // 20-40px
          leftPosition: leftPosition,
          duration: 30, // SYNCHRONIZED: Single constant duration for all icons
          delay: delay, // Two-tiered delay system
          opacity: isEdgeColumn ? Math.random() * 0.3 + 0.2 : Math.random() * 0.4 + 0.4, // Edge: 0.2-0.5, Center: 0.4-0.8
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          isEdgeColumn: isEdgeColumn // Add flag for lens effect
        });
      }
    }
    
    setWaterfallElements(elements);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.5,
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden"
    >
      {/* Waterfall Background with CSS Gradient Mask */}
      <ClientOnly>
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat'
          }}
        >
          {waterfallElements.map((element) => {
            const isEdge = element.isEdgeColumn;
            const scale = isEdge ? 0.7 : 1.0;
            const blur = isEdge ? 'blur(1px)' : 'none';
            
            return (
              <motion.div
                key={element.id}
                className="absolute flex items-center justify-center cursor-pointer group"
                style={{
                  left: `${element.leftPosition}%`,
                  top: '-10%',
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  transform: `scale(${scale})`,
                  filter: blur,
                  opacity: element.opacity
                }}
                animate={{
                  y: ['0vh', '120vh']
                }}
                transition={{
                  duration: element.duration,
                  delay: element.delay,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'linear'
                }}
                whileHover={{
                  scale: isEdge ? 0.9 : 1.2,
                  transition: { duration: 0.3, ease: 'easeOut' }
                }}
              >
                {/* No container - direct SVG rendering for clean look */}
                {element.icon ? (
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
                    fill={darkIcons.includes(element.name || '') ? '#FFFFFF' : element.color}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    }}
                  >
                    <path d={element.icon.path} />
                  </svg>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </ClientOnly>

        {/* Text Content */}
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div 
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F5F5F5] mb-8 leading-tight"
            variants={textVariants}
          >
            هرج‌ومرجی که هر روز زندگی می‌کردم
          </motion.h2>
          
          <motion.p 
            className="text-lg sm:text-xl text-[#A1A1A1] max-w-4xl mx-auto leading-relaxed"
            variants={textVariants}
          >
            قبل از شبرا، تیم ما بین چندین ابزار پراکنده سرگردان بود. هر روز ساعت‌ها صرف جابجایی، هماهنگی و جستجوی اطلاعات می‌شد. این فقط یک مشکل کارایی نبود؛ یک فرسودگی مداوم بود که انرژی را از کارهای مهم‌تر می‌گرفت.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}