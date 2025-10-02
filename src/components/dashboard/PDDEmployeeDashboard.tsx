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
        /* Desktop Layout - True CSS Grid System */
        <div className="min-h-screen bg-white" dir="rtl">
          {/* Master Grid Container */}
          <div className="grid grid-cols-12 gap-6 p-6 w-full">
            
            {/* Left Column - Status Card (3 columns) */}
            <div className="col-span-12 md:col-span-3">
              <SmartStatusCard variant="desktop" />
            </div>

            {/* Center Column - Main Content (6 columns) */}
            <div className="col-span-12 md:col-span-6 flex flex-col gap-6">
              {/* Today's Focus - Primary Widget */}
              <TodaysFocusWidget />
              
              {/* Announcements - Below Today's Focus */}
              <AnnouncementsWidget variant="desktop" />
            </div>

            {/* Right Column - Information Panel (3 columns) */}
            <div className="col-span-12 md:col-span-3 flex flex-col gap-6">
              {/* Next Up Widget */}
              <NextUpWidget variant="desktop" />
              
              {/* My Requests Widget */}
              <MyRequestsWidget variant="desktop" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

