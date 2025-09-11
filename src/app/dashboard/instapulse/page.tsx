'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PageManager from '@/components/instapulse/page-manager';
import ReelsGrid from '@/components/instapulse/reels-grid';
import ReelsFilters, { ReelsFilters as ReelsFiltersType } from '@/components/instapulse/reels-filters';
import ReelsGridSkeleton from '@/components/instapulse/reels-grid-skeleton';
import { useInstapulseReels } from '@/hooks/use-instapulse-reels';

export default function InstaPulsePage() {
  // State for temporary filters (what user is selecting)
  const [tempFilters, setTempFilters] = useState<ReelsFiltersType>({
    dateRange: undefined,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // State for applied filters (what triggers API calls)
  const [appliedFilters, setAppliedFilters] = useState<ReelsFiltersType>({
    dateRange: undefined,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // Fetch reels using TanStack Query
  const { reels, isLoading, isError, error } = useInstapulseReels(appliedFilters);

  // Handle temporary filter changes
  const handleFiltersChange = (newFilters: ReelsFiltersType) => {
    setTempFilters(newFilters);
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
  };

  // Handle resetting filters
  const handleResetFilters = () => {
    const defaultFilters: ReelsFiltersType = {
      dateRange: undefined,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    };
    setTempFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };


  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          InstaPulse Dashboard
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              Add New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Manage Tracked Pages</DialogTitle>
            </DialogHeader>
            <PageManager />
          </DialogContent>
        </Dialog>
      </div>

      {/* Separator */}
      <Separator className="mb-6" />

      {/* Filter Controls */}
      <div className="mb-8">
        <ReelsFilters 
          onFiltersChange={handleFiltersChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          initialFilters={tempFilters}
        />
      </div>

      {/* Reels Grid */}
      <div>
        {isLoading ? (
          <ReelsGridSkeleton count={6} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Failed to Load Reels
            </h3>
            <p className="text-muted-foreground max-w-md mb-4">
              {error?.message || 'Something went wrong while loading the reels. Please try again.'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <ReelsGrid reels={reels} />
        )}
      </div>
    </div>
  );
}
