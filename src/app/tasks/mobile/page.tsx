'use client';

import { MobileTasksList } from '@/components/tasks/mobile/MobileTasksList';
import { useMobile } from '@/hooks/useResponsive';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MobileTasksPage() {
  const isMobile = useMobile();
  const router = useRouter();

  useEffect(() => {
    if (!isMobile) {
      router.push('/tasks');
    }
  }, [isMobile, router]);

  if (!isMobile) {
    return null;
  }

  return <MobileTasksList />;
}
