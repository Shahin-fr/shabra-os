'use client';

import { Eye, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
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

export default function ReelCard({ reel }: ReelCardProps) {
  const relativeTime = formatDistanceToNow(new Date(reel.publishedAt), {
    addSuffix: true,
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Card Header - Page Info */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between" dir="ltr">
          <div className="flex items-center gap-3 justify-start">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={`https://www.instagram.com/${reel.trackedPage.username}/`} 
                alt={`@${reel.trackedPage.username}`}
              />
              <AvatarFallback className="text-xs">
                {getInitials(reel.trackedPage.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm text-foreground">
                @{reel.trackedPage.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {reel.trackedPage.followerCount.toLocaleString()} followers
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground" dir="ltr">
            {relativeTime}
          </span>
        </div>
      </CardHeader>

      {/* Card Content - Thumbnail */}
      <CardContent className="p-0">
        <AspectRatio ratio={9 / 16}>
          <a
            href={reel.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full relative overflow-hidden group"
          >
            {reel.thumbnailUrl ? (
              <Image
                src={reel.thumbnailUrl}
                alt={`Reel by @${reel.trackedPage.username}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  console.error('Failed to load thumbnail:', reel.thumbnailUrl);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
                onLoad={() => {
                  console.log('Successfully loaded thumbnail:', reel.thumbnailUrl);
                }}
              />
            ) : null}
            {/* Fallback div - always present but hidden when image loads */}
            <div className={`absolute inset-0 bg-muted flex items-center justify-center ${reel.thumbnailUrl ? 'hidden' : ''}`}>
              <span className="text-muted-foreground text-sm">
                {reel.thumbnailUrl ? 'Loading...' : 'No thumbnail'}
              </span>
            </div>
          </a>
        </AspectRatio>
      </CardContent>

      {/* Card Footer - Stats */}
      <CardFooter className="pt-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* View Count */}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatNumber(reel.viewCount)}
              </span>
            </div>

            {/* Virality Score */}
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">
                {reel.viralityScore.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Short Code for reference */}
          <span className="text-xs text-muted-foreground">
            {reel.shortCode}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
