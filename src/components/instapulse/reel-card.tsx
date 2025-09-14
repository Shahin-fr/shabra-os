'use client';

import { Eye, Flame } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Type definition for Instagram Reel
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

interface ReelCardProps {
  reel: InstagramReel;
}

// Helper function to format numbers (e.g., 1.2M, 250K)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Helper function to get initials from username
function getInitials(username: string): string {
  return username
    .split('')
    .filter(char => /[a-zA-Z0-9]/.test(char))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Helper function to format time in English
function formatTimeEnglish(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Few minutes ago';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
}

// Helper function to get virality score styling
function getViralityScoreStyle(score: number) {
  if (score >= 50) {
    // High virality - Very eye-catching
    return {
      containerClass: "bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/50 border border-red-400/50 px-2 py-1",
      iconClass: "h-3 w-3 text-white drop-shadow-lg",
      textClass: "text-white font-bold text-xs"
    };
  } else if (score >= 20) {
    // Medium virality - Moderately eye-catching
    return {
      containerClass: "bg-gradient-to-r from-orange-400 to-yellow-500 shadow-md shadow-orange-500/30 border border-orange-300/50 px-2 py-1",
      iconClass: "h-3 w-3 text-white drop-shadow-md",
      textClass: "text-white font-semibold text-xs"
    };
  } else {
    // Low virality - Subtle
    return {
      containerClass: "bg-white/15 backdrop-blur-sm border border-white/20 px-2 py-1",
      iconClass: "h-3 w-3 text-orange-400",
      textClass: "text-white font-medium text-xs"
    };
  }
}

export default function ReelCard({ reel }: ReelCardProps) {
  const relativeTime = formatTimeEnglish(new Date(reel.publishedAt));
  const [imageError, setImageError] = useState(false);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  
  // Get virality score styling
  const viralityStyle = getViralityScoreStyle(reel.viralityScore);

  // Debug: Log reel data (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Reel data:', {
      id: reel.id,
      thumbnailUrl: reel.thumbnailUrl,
      username: reel.trackedPage.username,
      viewCount: reel.viewCount,
      postUrl: reel.postUrl
    });
  }

  // Try to load image with retry
  const handleImageError = () => {
    console.log('Image failed to load, retry count:', imageRetryCount);
    if (imageRetryCount < 2) {
      setImageRetryCount(prev => prev + 1);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setImageError(false);
    setImageRetryCount(0);
  };

  // Create a proxy URL for Instagram images
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    // Use a proxy service for Instagram images to avoid CORS issues
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=400&h=600&fit=cover&output=webp`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-pink-500/10 hover:shadow-3xl hover:shadow-pink-500/20 transition-all duration-300 group backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1" dir="ltr">
      <AspectRatio ratio={9 / 16}>
        <a
          href={reel.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full relative overflow-hidden"
        >
          {/* Background Image */}
          {reel.thumbnailUrl && !imageError ? (
            <img
              src={getImageUrl(reel.thumbnailUrl) || ''}
              alt={`Reel by @${reel.trackedPage.username}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              onLoad={handleImageLoad}
              key={`${reel.id}-${imageRetryCount}`}
            />
          ) : null}
          
          {/* Fallback div - shown when no image or image fails to load */}
          <div className={`absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 flex items-center justify-center ${reel.thumbnailUrl && !imageError ? 'hidden' : ''}`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-10 h-10 text-white"
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
              <span className="text-white text-lg font-semibold drop-shadow-lg mb-2">
                @{reel.trackedPage.username}
              </span>
              <div className="text-white/80 text-sm">
                {formatNumber(reel.viewCount)} views
              </div>
            </div>
          </div>

          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

          {/* Top Overlay - User Info */}
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8 border border-white/30 flex-shrink-0">
                <AvatarImage 
                  src={`https://www.instagram.com/${reel.trackedPage.username}/`} 
                  alt={`@${reel.trackedPage.username}`}
                />
                <AvatarFallback className="text-xs bg-white/10 text-white">
                  {getInitials(reel.trackedPage.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-center">
                <span className="font-medium text-white text-sm drop-shadow-md">
                  @{reel.trackedPage.username}
                </span>
                <span className="text-white/80 text-xs drop-shadow-md">
                  {formatNumber(reel.trackedPage.followerCount)} Followers
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Overlay - Stats */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="flex items-end justify-between">
              {/* Left side - Time and Views */}
              <div className="flex flex-col gap-1">
                <span className="text-white text-xs font-medium drop-shadow-md">
                  {relativeTime}
                </span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-white/80 flex-shrink-0" />
                  <span className="text-white/80 text-sm font-medium drop-shadow-md">
                    {formatNumber(reel.viewCount)}
                  </span>
                </div>
              </div>

              {/* Right side - Virality Score */}
              <div className={`flex items-center gap-1 rounded-full ${viralityStyle.containerClass}`}>
                <Flame className={`${viralityStyle.iconClass} flex-shrink-0`} />
                <span className={viralityStyle.textClass}>
                  {reel.viralityScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </a>
      </AspectRatio>
    </div>
  );
}
