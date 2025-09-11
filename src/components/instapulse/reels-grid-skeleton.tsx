import ReelCardSkeleton from './reel-card-skeleton';

interface ReelsGridSkeletonProps {
  count?: number;
}

export default function ReelsGridSkeleton({ count = 6 }: ReelsGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <ReelCardSkeleton key={index} />
      ))}
    </div>
  );
}
