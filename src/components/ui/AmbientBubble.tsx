"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
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
  duration = 6,
  parallaxSpeed = 0.7
}: AmbientBubbleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // CORRECT WAY: Call hooks at the top level.
  // useTransform is already optimized, no need for useMemo here.
  const y = useTransform(scrollYProgress, [0, 1], [0, -120 * parallaxSpeed]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.9, 0.6]);

  // Simplified animation variants (This part was okay)
  const animationVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0.6, 0.9, 0.6],
      scale: [1, 1.1, 1],
      y: [-15, 15, -15]
    }
  };

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
      variants={animationVariants}
      initial="initial"
      animate="animate"
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
          // Use the top-level motion values directly
          y: y,
          opacity: opacity,
          boxShadow: `
            0 0 20px rgba(253, 214, 232, 0.4),
            0 0 40px rgba(253, 214, 232, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.5)
          `
        }}
        whileHover={{
          scale: 1.2,
          transition: { duration: 0.2 }
        }}
      />
    </motion.div>
  );
}