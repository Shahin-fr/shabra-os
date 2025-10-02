'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useOptimalAnimationSettings } from '@/hooks/useAnimationPerformance';

interface OptimizedMotionProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof React.JSX.IntrinsicElements;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
  whileInView?: any;
  whileDrag?: any;
  viewport?: any;
  layout?: boolean;
  layoutId?: string;
  drag?: any;
  dragConstraints?: any;
  dragElastic?: any;
  dragMomentum?: any;
  dragPropagation?: any;
  dragSnapToOrigin?: any;
  dragTransition?: any;
  onDrag?: any;
  onDragStart?: any;
  onDragEnd?: any;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  onHoverStart?: any;
  onHoverEnd?: any;
  [key: string]: any;
}

/**
 * Optimized motion component that only uses hardware-accelerated properties
 * and respects user's motion preferences
 */
export const OptimizedMotion = forwardRef<HTMLDivElement, OptimizedMotionProps>(
  (
    {
      children,
      className = '',
      style = {},
      as = 'div',
      initial,
      animate,
      exit,
      transition,
      whileHover,
      whileTap,
      whileInView,
      whileDrag,
      viewport,
      layout = false,
      layoutId,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      dragPropagation,
      dragSnapToOrigin,
      dragTransition,
      onDrag,
      onDragStart,
      onDragEnd,
      onAnimationComplete,
      onAnimationStart,
      onHoverStart,
      onHoverEnd,
      ...props
    },
    ref
  ) => {
    const { shouldAnimate, animationDuration, staggerDelay } = useReducedMotion();
    const { enableAnimations, duration, easing } = useOptimalAnimationSettings();
    
    // Use the reduced motion duration if available, otherwise use the optimal duration
    const finalDuration = shouldAnimate ? duration : animationDuration;

    // If animations are disabled, return a regular element
    if (!shouldAnimate || !enableAnimations) {
      const Component = as as any;
      
      // Filter out motion-specific props that shouldn't be passed to regular HTML elements
      const {
        onHoverStart,
        onHoverEnd,
        ...htmlProps
      } = props;
      
      return (
        <Component
          ref={ref}
          className={className}
          style={style}
          {...htmlProps}
        >
          {children}
        </Component>
      );
    }

    // Optimize animation properties to only use hardware-accelerated ones
    const optimizedInitial = initial ? optimizeAnimationProps(initial) : undefined;
    const optimizedAnimate = animate ? optimizeAnimationProps(animate) : undefined;
    const optimizedExit = exit ? optimizeAnimationProps(exit) : undefined;
    const optimizedWhileHover = whileHover ? optimizeAnimationProps(whileHover) : undefined;
    const optimizedWhileTap = whileTap ? optimizeAnimationProps(whileTap) : undefined;
    const optimizedWhileInView = whileInView ? optimizeAnimationProps(whileInView) : undefined;

    // Optimize transition
    const optimizedTransition = transition ? {
      ...transition,
      duration: transition.duration || finalDuration,
      staggerChildren: transition.staggerChildren || staggerDelay,
      ease: transition.ease || easing,
    } : {
      duration: finalDuration,
      ease: easing,
    };

    // Use the correct motion component based on the 'as' prop
    const MotionComponent = motion[as as keyof typeof motion] || motion.div;
    
    // Cast to any to avoid complex type inference issues
    const SafeMotionComponent = MotionComponent as any;
    
    return (
      <SafeMotionComponent
        ref={ref}
        className={className}
        style={{
          ...style,
          willChange: 'transform, opacity', // Hint to browser for optimization
        }}
        initial={optimizedInitial}
        animate={optimizedAnimate}
        exit={optimizedExit}
        transition={optimizedTransition}
        whileHover={optimizedWhileHover}
        whileTap={optimizedWhileTap}
        whileInView={optimizedWhileInView}
        whileDrag={whileDrag}
        viewport={viewport}
        layout={layout}
        layoutId={layoutId}
        drag={drag}
        dragConstraints={dragConstraints}
        dragElastic={dragElastic}
        dragMomentum={dragMomentum}
        dragPropagation={dragPropagation}
        dragSnapToOrigin={dragSnapToOrigin}
        dragTransition={dragTransition}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onAnimationComplete={onAnimationComplete}
        onAnimationStart={onAnimationStart}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        {...props}
      >
        {children}
      </SafeMotionComponent>
    );
  }
);

OptimizedMotion.displayName = 'OptimizedMotion';

/**
 * Optimize animation properties to only use hardware-accelerated properties
 */
function optimizeAnimationProps(props: any): any {
  if (!props || typeof props !== 'object') return props;

  const optimized: any = {};

  for (const [key, value] of Object.entries(props)) {
    switch (key) {
      // Hardware-accelerated properties (keep as-is)
      case 'opacity':
      case 'x':
      case 'y':
      case 'z':
      case 'scale':
      case 'scaleX':
      case 'scaleY':
      case 'scaleZ':
      case 'rotate':
      case 'rotateX':
      case 'rotateY':
      case 'rotateZ':
      case 'skew':
      case 'skewX':
      case 'skewY':
        optimized[key] = value;
        break;
      
      // Convert problematic properties to hardware-accelerated equivalents
      case 'width':
        // Convert width animation to scaleX with transform-origin
        if (typeof value === 'string' && value.includes('%')) {
          const percentage = parseFloat(value.replace('%', ''));
          optimized.scaleX = percentage / 100;
          optimized.transformOrigin = 'left center';
        } else {
          optimized.scaleX = 1;
        }
        break;
      
      case 'height':
        // Convert height animation to scaleY with transform-origin
        if (typeof value === 'string' && value.includes('%')) {
          const percentage = parseFloat(value.replace('%', ''));
          optimized.scaleY = percentage / 100;
          optimized.transformOrigin = 'center top';
        } else if (value === 'auto') {
          // For height: auto, use opacity instead
          optimized.opacity = 1;
        } else {
          optimized.scaleY = 1;
        }
        break;
      
      case 'top':
        // Convert top to y with transform-origin
        optimized.y = typeof value === 'number' ? value : 0;
        break;
      
      case 'left':
        // Convert left to x with transform-origin
        optimized.x = typeof value === 'number' ? value : 0;
        break;
      
      case 'marginTop':
        // Convert marginTop to y
        optimized.y = typeof value === 'number' ? value : 0;
        break;
      
      case 'marginLeft':
        // Convert marginLeft to x
        optimized.x = typeof value === 'number' ? value : 0;
        break;
      
      // Skip non-hardware-accelerated properties
      case 'margin':
      case 'padding':
      case 'border':
      case 'borderRadius':
      case 'fontSize':
      case 'lineHeight':
      case 'backgroundColor':
      case 'color':
      case 'background':
      case 'backgroundImage':
      case 'backgroundPosition':
      case 'backgroundSize':
      case 'boxShadow':
      case 'textShadow':
      case 'borderColor':
      case 'borderWidth':
      case 'borderStyle':
        // Skip these properties as they cause layout shifts
        break;
      
      // Recursively optimize nested objects
      default:
        if (typeof value === 'object' && value !== null) {
          optimized[key] = optimizeAnimationProps(value);
        } else {
          optimized[key] = value;
        }
        break;
    }
  }

  return optimized;
}

/**
 * Optimized AnimatePresence component
 */
export const OptimizedAnimatePresence = ({ children, ...props }: any) => {
  const { shouldAnimate } = useReducedMotion();

  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return <AnimatePresence {...props}>{children}</AnimatePresence>;
};

/**
 * Pre-defined optimized animation variants
 */
export const optimizedVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  
  scaleInUp: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -20 },
  },
  
  // Stagger animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  
  // Hover animations
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },
  
  hoverLift: {
    whileHover: { y: -5 },
    whileTap: { y: 0 },
  },
  
  // Progress bar animation (optimized)
  progressBar: {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    style: { transformOrigin: 'left center' },
  },
};

