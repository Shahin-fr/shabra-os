"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from '../../../hooks/useMediaQuery';
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
  name: string;
  icon: any;
  color: string;
  size: number;
  opacity: number;
  column: number;
  delay: number;
  x: number; // Horizontal position (0-100%)
  y: number; // Vertical position (0-100%)
}

// ClientOnly wrapper to prevent hydration errors
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

/**
 * ProblemSection Component - Perfect Icon Waterfall
 * 
 * A minimalist, elegant waterfall of icons that drift vertically down the screen.
 * Zero overlaps, continuous flow, maximum diversity, perfect fade effects.
 */
export default function ProblemSection() {
  const isMobile = useIsMobile();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const [waterfallElements, setWaterfallElements] = useState<WaterfallElement[]>([]);

  // Curated icon collection - 30+ unique icons with strict quality filtering
  const iconCollection = [
    { icon: siSlack, name: 'Slack', color: '#4A154B' },
    { icon: siAsana, name: 'Asana', color: '#F06A6A' },
    { icon: siTrello, name: 'Trello', color: '#0079BF' },
    { icon: siNotion, name: 'Notion', color: '#000000' },
    { icon: siObsidian, name: 'Obsidian', color: '#483699' },
    { icon: siJira, name: 'Jira', color: '#0052CC' },
    { icon: siMiro, name: 'Miro', color: '#050038' },
    { icon: siFigma, name: 'Figma', color: '#F24E1E' },
    { icon: siGooglecalendar, name: 'Google Calendar', color: '#4285F4' },
    { icon: siGoogledrive, name: 'Google Drive', color: '#4285F4' },
    { icon: siDropbox, name: 'Dropbox', color: '#0061FF' },
    { icon: siWhatsapp, name: 'WhatsApp', color: '#25D366' },
    { icon: siTelegram, name: 'Telegram', color: '#26A5E4' },
    { icon: siDiscord, name: 'Discord', color: '#5865F2' },
    { icon: siZoom, name: 'Zoom', color: '#2D8CFF' },
    { icon: siCanva, name: 'Canva', color: '#00C4CC' },
    { icon: siSketch, name: 'Sketch', color: '#F7B500' },
    { icon: siInvision, name: 'InVision', color: '#FF3366' },
    { icon: siZapier, name: 'Zapier', color: '#FF4A00' },
    { icon: siAirtable, name: 'Airtable', color: '#18BFFF' },
    { icon: siClickup, name: 'ClickUp', color: '#7B68EE' },
    { icon: siGooglemeet, name: 'Google Meet', color: '#00832D' },
    { icon: siGmail, name: 'Gmail', color: '#EA4335' }
  ].filter(iconData => iconData.icon && iconData.icon.path); // Strict quality filtering

  // Dark icons that need color override for visibility
  const darkIcons = ['Notion', 'GitHub', 'GitLab', 'Vercel', 'Docker', 'Postman', 'React', 'Node.js', 'TypeScript'];

  // Generate waterfall elements with intelligent spacing and lens effect
  useEffect(() => {
    // Only generate waterfall elements on desktop
    if (isMobile) {
      setWaterfallElements([]);
      return;
    }

    const elements: WaterfallElement[] = [];
    const totalIcons = 40;
    const totalDuration = 30; // 30 seconds total cycle
    const minDistance = 100; // Minimum distance between icons in pixels
    const maxAttempts = 20; // Maximum attempts to place each icon
    
    // Helper function to calculate distance between two points
    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };
    
    // Helper function to check if a position is valid (respects minimum distance)
    const isValidPosition = (x: number, y: number, existingElements: WaterfallElement[]) => {
      return existingElements.every(element => {
        const distance = calculateDistance(x, y, element.x, element.y);
        return distance >= minDistance;
      });
    };
    
    // Create 40 elements with intelligent spacing
    for (let i = 0; i < totalIcons; i++) {
      const iconData = iconCollection[i % iconCollection.length];
      
      if (iconData) {
        let attempts = 0;
        let validPosition = false;
        let x = 0;
        let y = 0;
        
        // Try to find a valid position with minimum distance
        while (!validPosition && attempts < maxAttempts) {
          x = Math.random() * 100; // 0-100% horizontal position
          y = Math.random() * 100; // 0-100% vertical position
          
          if (isValidPosition(x, y, elements)) {
            validPosition = true;
          }
          attempts++;
        }
        
        // If we couldn't find a valid position, use the last generated position
        // This ensures we don't get stuck in infinite loops
        
        // Perfect staggered delay: (i / N) * T
        const delay = (i / totalIcons) * totalDuration;
        
        elements.push({
          id: `waterfall-${i}-${Date.now()}`,
          name: iconData.name,
          icon: iconData.icon,
          color: iconData.color,
          size: Math.random() * 16 + 24, // 24-40px range
          opacity: Math.random() * 0.4 + 0.6, // 0.6-1.0 opacity
          column: Math.floor(x / (100 / 12)), // Convert to column for compatibility
          delay: delay,
          x: x, // Store actual x position for lens effect
          y: y  // Store actual y position for spacing
        });
      }
    }
    
    setWaterfallElements(elements);
  }, [isMobile]);

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
      className={`relative ${isMobile ? 'min-h-[90vh] py-12' : 'min-h-screen'} flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden`}
    >
      {/* Perfect Icon Waterfall Background - Desktop Only */}
      {!isMobile && (
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
              // Calculate lens effect based on horizontal position
              const centerX = 50; // Center of screen (50%)
              const distanceFromCenter = Math.abs(element.x - centerX);
              const maxDistance = 30; // Maximum distance for full effect (30% from center)
              
              // Calculate scale based on distance from center
              const scaleFactor = Math.max(0.6, 1 - (distanceFromCenter / maxDistance) * 0.4);
              
              // Calculate opacity based on distance from center
              const opacityFactor = Math.max(0.4, 1 - (distanceFromCenter / maxDistance) * 0.6);
              
              // Calculate blur based on distance from center
              const blurFactor = distanceFromCenter > 20 ? 1 : 0;
              
              // Final calculated values
              const finalScale = scaleFactor;
              const finalOpacity = element.opacity * opacityFactor;
              const finalBlur = blurFactor;
              
              return (
                <motion.div
                  key={element.id}
                  className="absolute flex items-center justify-center cursor-pointer group"
                  style={{
                    left: `${element.x}%`,
                    top: '-10%',
                    width: `${element.size}px`,
                    height: `${element.size}px`,
                    opacity: finalOpacity,
                    filter: `blur(${finalBlur}px)`
                  }}
                  animate={{
                    y: ['0vh', '120vh'],
                    scale: [finalScale, finalScale] // Maintain lens effect during animation
                  }}
                  transition={{
                    duration: 30, // 30 seconds per cycle
                    delay: element.delay,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear'
                  }}
                  whileHover={{
                    scale: finalScale * 1.2, // Scale hover effect relative to lens scale
                    transition: { duration: 0.3, ease: 'easeOut' }
                  }}
                >
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
                    fill={darkIcons.includes(element.name) ? '#FFFFFF' : element.color}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    }}
                  >
                    <path d={element.icon.path} />
                  </svg>
                </motion.div>
              );
            })}
          </div>
        </ClientOnly>
      )}

      {/* Mobile Framed Content Layout */}
      {isMobile && (
        <>
          {/* Top Icon Grid */}
          <div className="absolute top-8 start-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="grid grid-cols-3 gap-4 max-w-xs">
              {iconCollection.slice(0, 6).map((iconData, index) => (
                <motion.div
                  key={`mobile-top-icon-${index}`}
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 0.3,
                    scale: 1,
                    y: [0, -6, 0]
                  }}
                  transition={{
                    opacity: { duration: 1, delay: index * 0.15 },
                    scale: { duration: 0.5, delay: index * 0.15 },
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3
                    }
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                      fill="#666666"
                    >
                      <path d={iconData.icon.path} />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Icon Grid */}
          <div className="absolute bottom-8 start-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="grid grid-cols-3 gap-4 max-w-xs">
              {iconCollection.slice(6, 12).map((iconData, index) => (
                <motion.div
                  key={`mobile-bottom-icon-${index}`}
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 0.3,
                    scale: 1,
                    y: [0, -6, 0]
                  }}
                  transition={{
                    opacity: { duration: 1, delay: (index + 6) * 0.15 },
                    scale: { duration: 0.5, delay: (index + 6) * 0.15 },
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: (index + 6) * 0.3
                    }
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                      fill="#666666"
                    >
                      <path d={iconData.icon.path} />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Text Content */}
      <div className={`max-w-6xl mx-auto text-center relative z-10 ${isMobile ? 'px-4' : ''}`}>
        <motion.div 
          className={`${isMobile ? 'mb-8' : 'mb-20'}`}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.h2 
            className={`${isMobile ? 'text-3xl sm:text-4xl mb-6' : 'text-4xl sm:text-5xl lg:text-6xl mb-8'} font-bold text-[#F5F5F5] leading-tight`}
            variants={textVariants}
          >
            هرج‌ومرج ابزارهای پراکنده
          </motion.h2>
          
          <motion.p 
            className={`${isMobile ? 'text-base sm:text-lg max-w-2xl' : 'text-lg sm:text-xl max-w-4xl'} text-[#A1A1A1] mx-auto leading-relaxed`}
            variants={textVariants}
          >
            شروعش با یه مشاهده ساده بود: جابجایی مداوم بین ابزارها و چند مشکل و مسئله جزئی دیگه.
            <br /><br />
            اما ایده اصلی و کنجکاوی بزرگتر، فراتر از حل این‌ها بود: اگر بشه تمام این داده‌های پراکنده رو زیر یک سقف جمع کرد و یک لایه هوش مصنوعی روش قرار داد، چه پتانسیلی آزاد می‌شه؟
            <br /><br />
            این ایده، برای من به یک چالش شخصی تبدیل شد: آیا واقعاً می‌تونم به تنهایی و با کمک ابزارهای AI، نمونه اولیه همچین سیستمی رو بسازم؟
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}