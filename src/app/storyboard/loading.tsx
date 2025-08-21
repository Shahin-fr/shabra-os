import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StoryboardLoading() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-12 w-48 mb-3" />
          <Skeleton className="h-6 w-80" />
        </div>

        {/* Storyboard Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Calendar Header Skeleton */}
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>

            {/* Story Canvas Skeleton */}
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Palette Skeleton */}
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Skeleton */}
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
