import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export default function ReelCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white/10 backdrop-blur-2xl shadow-lg">
      {/* Card Header Skeleton */}
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar Skeleton */}
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-1">
              {/* Username Skeleton */}
              <Skeleton className="h-4 w-20" />
              {/* Follower count Skeleton */}
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          {/* Date Skeleton */}
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Card Content Skeleton - Thumbnail */}
      <div className="p-0">
        <AspectRatio ratio={9 / 16}>
          <Skeleton className="h-full w-full" />
        </AspectRatio>
      </div>

      {/* Card Footer Skeleton - Stats */}
      <div className="p-6 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View count Skeleton */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
            {/* Virality score Skeleton */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
          {/* Short code Skeleton */}
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
