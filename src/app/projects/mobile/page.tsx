'use client';

import { MobileProjectsList } from '@/components/projects/mobile/MobileProjectsList';
import { useMobile } from '@/hooks/useResponsive';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MobileProjectsPage() {
  const isMobile = useMobile();
  const router = useRouter();

  useEffect(() => {
    if (!isMobile) {
      router.push('/projects');
    }
  }, [isMobile, router]);

  if (!isMobile) {
    return null;
  }

  return <MobileProjectsList />;
}
