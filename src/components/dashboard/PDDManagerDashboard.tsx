'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';

// Import ONLY PDD-specified widgets with correct names
import { ActionCenterWidget } from './widgets/ActionCenterWidget';
import { TeamActivityWidget as TodaysTeamActivityWidget } from './widgets/TeamActivityWidget';
import { TasksAtRiskWidget } from './widgets/TasksAtRiskWidget';
import { TeamPresenceWidget } from './widgets/TeamPresenceWidget';
import { QuickActionsWidget as QuickLinksWidget } from './widgets/QuickActionsWidget';

export function PDDManagerDashboard() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      {/* Mobile Layout - Single Column */}
      {isMobile ? (
        <div className="min-h-screen p-4 pb-20">
          <div className="max-w-7xl mx-auto space-y-6">
            <TeamPresenceWidget variant="mobile" />
            <ActionCenterWidget variant="mobile" priority="high" />
            <TasksAtRiskWidget variant="mobile" />
            <TodaysTeamActivityWidget variant="mobile" />
          </div>
        </div>
      ) : (
        /* Desktop Layout - True CSS Grid System */
        <div className="min-h-screen bg-white" dir="rtl">
          {/* Master Grid Container - Full Width */}
          <div className="grid grid-cols-12 gap-8 p-8 w-full max-w-none">
            
            {/* Left Column - Team Presence (3 columns) */}
            <div className="col-span-12 md:col-span-3">
              <TeamPresenceWidget variant="desktop" />
            </div>

            {/* Center Column - Main Content (6 columns) */}
            <div className="col-span-12 md:col-span-6 flex flex-col gap-6">
              {/* Action Center - Primary Widget */}
              <ActionCenterWidget variant="desktop" priority="high" />

              {/* Team Activity - Below Action Center */}
              <TodaysTeamActivityWidget variant="desktop" />
            </div>

            {/* Right Column - Quick Actions & Tasks at Risk (3 columns) */}
            <div className="col-span-12 md:col-span-3 flex flex-col gap-6">
              <QuickLinksWidget variant="desktop" priority="high" />
              <TasksAtRiskWidget variant="desktop" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

