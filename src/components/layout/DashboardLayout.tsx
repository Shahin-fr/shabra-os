"use client";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { GlobalStatusIndicator } from "@/components/ui/GlobalStatusIndicator";
import dynamic from "next/dynamic";

// Dynamically import AmbientBubble to improve chunk loading
const AmbientBubble = dynamic(() => import("@/components/ui/AmbientBubble").then(mod => ({ default: mod.AmbientBubble })), {
  ssr: false,
  loading: () => null
});

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 overflow-hidden">
      {/* Optimized Ambient Bubbles Background - Reduced from 14 to 6 for better performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AmbientBubble size={120} initialX="15%" initialY="20%" delay={0} duration={8} parallaxSpeed={0.4} />
        <AmbientBubble size={160} initialX="80%" initialY="30%" delay={1} duration={10} parallaxSpeed={0.8} />
        <AmbientBubble size={100} initialX="75%" initialY="65%" delay={2} duration={7} parallaxSpeed={0.6} />
        <AmbientBubble size={140} initialX="25%" initialY="75%" delay={0.5} duration={12} parallaxSpeed={0.5} />
        <AmbientBubble size={130} initialX="85%" initialY="85%" delay={1.5} duration={9} parallaxSpeed={0.7} />
        <AmbientBubble size={110} initialX="10%" initialY="90%" delay={3} duration={8} parallaxSpeed={0.9} />
      </div>
      
      <Header />
      <Sidebar />
      <main className="relative md:mr-64 p-6 mt-16 z-5">
        <div className="relative z-5">
          {children}
        </div>
      </main>
      
      {/* Global Status Indicator */}
      <GlobalStatusIndicator />
    </div>
  );
}
