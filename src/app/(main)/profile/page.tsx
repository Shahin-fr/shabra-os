'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.id) {
      router.push(`/profile/${user.id}`);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>در حال بارگذاری پروفایل...</p>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <p>لطفاً ابتدا وارد شوید</p>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </div>
    );
  }

  return null; // Will redirect
}