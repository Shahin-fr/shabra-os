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
            <TasksAtRiskWidget variant="mobile" priority="high" />
            <TodaysTeamActivityWidget variant="mobile" />
          </div>
        </div>
      ) : (
        /* Desktop Layout - Three Columns as per PDD */
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Navigation Sidebar (handled by global navigation) */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                {/* Team Presence Widget - TOP PRIORITY in sidebar */}
                <TeamPresenceWidget variant="desktop" priority="high" />
              </div>

              {/* Center Column - Main Content (Command Center) */}
              <div className="col-span-12 lg:col-span-6 space-y-6">
                {/* Action Center Widget - TOP PRIORITY */}
                <ActionCenterWidget variant="desktop" priority="high" />
                
                {/* فعالیت امروز تیم Widget */}
                <TodaysTeamActivityWidget variant="desktop" />
                
                {/* تسک های فوری Widget */}
                <TasksAtRiskWidget variant="desktop" priority="high" />
              </div>

              {/* Right Column - Information Sidebar */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                {/* Quick Links Widget */}
                <QuickLinksWidget variant="desktop" priority="high" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

