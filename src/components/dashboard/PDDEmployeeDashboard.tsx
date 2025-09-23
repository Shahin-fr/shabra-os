'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';

// Import ONLY PDD-specified widgets
import { TodaysFocusWidget } from './widgets/TodaysFocusWidget';
import { SmartStatusCard } from './widgets/SmartStatusCard';
import { MyRequestsWidget } from './widgets/MyRequestsWidget';
import { NextUpWidget } from './widgets/NextUpWidget';
import { AnnouncementsWidget } from './widgets/AnnouncementsWidget';

export function PDDEmployeeDashboard() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      {/* Mobile Layout - Single Column */}
      {isMobile ? (
        <div className="min-h-screen p-4 pb-20">
          <div className="max-w-7xl mx-auto space-y-6">
            <SmartStatusCard variant="mobile" />
            <TodaysFocusWidget />
            <NextUpWidget variant="mobile" />
            <MyRequestsWidget variant="mobile" />
            <AnnouncementsWidget variant="mobile" />
          </div>
        </div>
      ) : (
        /* Desktop Layout - Three Columns */
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Status Card */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                <SmartStatusCard variant="desktop" />
              </div>

              {/* Center Column - Main Content */}
              <div className="col-span-12 lg:col-span-6 space-y-6">
                <TodaysFocusWidget />
                <AnnouncementsWidget variant="desktop" />
              </div>

              {/* Right Column - Information */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                <NextUpWidget variant="desktop" />
                <MyRequestsWidget variant="desktop" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

