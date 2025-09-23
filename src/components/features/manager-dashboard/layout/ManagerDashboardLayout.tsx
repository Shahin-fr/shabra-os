import React from 'react';

type ManagerDashboardLayoutProps = {
  children: React.ReactNode;
  rightSidebar: React.ReactNode;
};

const ManagerDashboardLayout = ({ children, rightSidebar }: ManagerDashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single responsive container - column on mobile, row on desktop */}
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Main Content Column - takes up most space */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Right Information Column - narrower column for supplementary widgets */}
        <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            {rightSidebar}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ManagerDashboardLayout;
