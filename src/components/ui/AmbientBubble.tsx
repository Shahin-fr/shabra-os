"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface AmbientBubbleProps {
  size?: number;
  initialX?: number | string;
  initialY?: number | string;
  delay?: number;
  duration?: number;
  parallaxSpeed?: number;
}

export function AmbientBubble({
  size = 60,
  initialX = 0,
  initialY = 0,
  delay = 0,
  duration = 6, // Reduced from 8 to 6 for faster animation
  parallaxSpeed = 0.7 // Increased from 0.5 to 0.7 for more dynamic movement
}: AmbientBubbleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -120 * parallaxSpeed]); // Increased range from -100 to -120
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.9, 0.6]); // Increased opacity range

  return (
    <motion.div
      ref={ref}
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        left: initialX,
        top: initialY,
        zIndex: 0
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.6, 0.9, 0.6], // Increased opacity range
        scale: [1, 1.2, 1], // Increased scale range from 1.15 to 1.2
        y: [-20, 20, -20] // Increased movement range from -15/15 to -20/20
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className="w-full h-full rounded-full bg-gradient-to-br from-[#fdd6e8]/60 to-[#fbb6d9]/70 backdrop-blur-md border border-[#fdd6e8]/60 shadow-xl"
        style={{ 
          y, 
          opacity,
          boxShadow: `
            0 0 25px rgba(253, 214, 232, 0.4),
            0 0 50px rgba(253, 214, 232, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.5)
          `
        }}
        whileHover={{
          scale: 1.3, // Increased from 1.2 to 1.3
          boxShadow: `
            0 0 40px rgba(253, 214, 232, 0.6),
            0 0 80px rgba(253, 214, 232, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.7)
          `,
          transition: { duration: 0.3 }
        }}
      />
    </motion.div>
  );
}
