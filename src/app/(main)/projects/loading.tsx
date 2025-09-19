import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsLoading() {
  return (
    <div className='container mx-auto max-w-7xl'>
      {/* Page Header Skeleton */}
      <div className='mb-8'>
        <Skeleton className='h-12 w-48 mb-3' />
        <Skeleton className='h-6 w-80' />
      </div>

      {/* Projects Grid Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            className='h-full'
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `
                  0 8px 25px rgba(0, 0, 0, 0.1),
                  0 4px 15px rgba(253, 214, 232, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `,
            }}
          >
            <CardHeader className='pb-3'>
              <Skeleton className='h-6 w-32 mb-2' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                {/* Status Badge Skeleton */}
                <div className='flex items-center justify-between'>
                  <Skeleton className='h-6 w-20 rounded-full' />
                </div>

                {/* Project Stats Skeleton */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                  <div className='flex items-center gap-1'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                </div>

                {/* Last Updated Skeleton */}
                <Skeleton className='h-3 w-32' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

