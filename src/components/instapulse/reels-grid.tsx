'use client';

import { motion } from 'framer-motion';
import ReelCard from './reel-card';

// Type definition for Instagram Reel (same as in ReelCard)
interface InstagramReel {
  id: number;
  postUrl: string;
  shortCode: string;
  thumbnailUrl: string | null;
  viewCount: number;
  publishedAt: string;
  viralityScore: number;
  trackedPage: {
    id: number;
    username: string;
    profileUrl: string;
    followerCount: number;
    status: string;
  };
}

interface ReelsGridProps {
  reels: InstagramReel[];
}

export default function ReelsGrid({ reels }: ReelsGridProps) {
  // Animation variants for staggered effect
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

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  if (reels.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      هیچ ریلی یافت نشد
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      هیچ ریلی برای معیارهای انتخاب شده یافت نشد. فیلترهای خود را تنظیم کنید یا بعداً برای محتوای جدید بررسی کنید.
                    </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {reels.map((reel) => (
        <motion.div
          key={reel.id}
          variants={itemVariants}
          whileHover={{ 
            y: -8,
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ 
            scale: 0.98,
            transition: { duration: 0.1 }
          }}
        >
          <ReelCard reel={reel} />
        </motion.div>
      ))}
    </motion.div>
  );
}
