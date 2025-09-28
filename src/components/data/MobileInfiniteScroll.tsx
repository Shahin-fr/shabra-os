'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useCallback } from 'react';

interface MobileInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
}

export function MobileInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  children,
  className: _className,
}: MobileInfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target?.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: `${threshold}px`,
    });

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleObserver, threshold]);

  return (
    <div className={_className}>
      {children}

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={observerRef} className='py-4'>
          {isLoading ? (
            <OptimizedMotion
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex items-center justify-center py-4'
            >
              <Loader2 className='h-6 w-6 animate-spin text-pink-500' />
              <span className='text-sm text-gray-500 me-2'>
                در حال بارگذاری...
              </span>
            </OptimizedMotion>
          ) : (
            <div className='h-4' /> // Spacer when not loading
          )}
        </div>
      )}
    </div>
  );
}

