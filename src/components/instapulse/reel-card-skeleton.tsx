import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export default function ReelCardSkeleton() {
  return (
    <div
      className='relative overflow-hidden rounded-2xl border border-gray-200/20 shadow-sm'
      dir='ltr'
    >
      <AspectRatio ratio={9 / 16}>
        <div className='relative w-full h-full'>
          {/* Background Skeleton */}
          <Skeleton className='h-full w-full' />

          {/* Gradient Overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20' />

          {/* Top Overlay Skeleton - User Info */}
          <div className='absolute top-3 start-3 z-10'>
            <div className='flex items-start rtl:items-start gap-2'>
              {/* Avatar Skeleton */}
              <Skeleton className='h-8 w-8 rounded-full border border-white/30 flex-shrink-0' />
              <div className='flex flex-col justify-center gap-1'>
                {/* Username Skeleton */}
                <Skeleton className='h-4 w-20 bg-white/30' />
                {/* Follower count Skeleton */}
                <Skeleton className='h-3 w-24 bg-white/20' />
              </div>
            </div>
          </div>

          {/* Bottom Overlay Skeleton - Stats */}
          <div className='absolute bottom-3 start-3 end-3 z-10'>
            <div className='flex items-end rtl:items-start justify-between'>
              {/* Left side - Time and Views Skeleton */}
              <div className='flex flex-col gap-1'>
                <Skeleton className='h-3 w-16 bg-white/30' />
                <div className='flex items-center gap-1'>
                  <Skeleton className='h-4 w-4 bg-white/20 flex-shrink-0' />
                  <Skeleton className='h-4 w-8 bg-white/20' />
                </div>
              </div>

              {/* Right side - Virality Score Skeleton */}
              <div className='flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2 py-1'>
                <Skeleton className='h-3 w-3 bg-white/40 flex-shrink-0' />
                <Skeleton className='h-3 w-5 bg-white/40' />
              </div>
            </div>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
}

