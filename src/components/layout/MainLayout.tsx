import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AmbientBubble } from "@/components/ui/AmbientBubble";
import { GlobalStatusIndicator } from "@/components/ui/GlobalStatusIndicator";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 overflow-hidden">
      {/* Enhanced Ambient Bubbles Background - More Dynamic */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AmbientBubble size={120} initialX="15%" initialY="20%" delay={0} duration={8} parallaxSpeed={0.4} />
        <AmbientBubble size={160} initialX="80%" initialY="30%" delay={1} duration={10} parallaxSpeed={0.8} />
        <AmbientBubble size={100} initialX="75%" initialY="65%" delay={2} duration={7} parallaxSpeed={0.6} />
        <AmbientBubble size={140} initialX="25%" initialY="75%" delay={0.5} duration={12} parallaxSpeed={0.5} />
        <AmbientBubble size={130} initialX="85%" initialY="85%" delay={1.5} duration={9} parallaxSpeed={0.7} />
        <AmbientBubble size={110} initialX="10%" initialY="90%" delay={3} duration={8} parallaxSpeed={0.9} />
        <AmbientBubble size={150} initialX="65%" initialY="15%" delay={2.5} duration={11} parallaxSpeed={0.3} />
        <AmbientBubble size={90} initialX="45%" initialY="45%" delay={1.8} duration={10} parallaxSpeed={1.0} />
        <AmbientBubble size={115} initialX="35%" initialY="10%" delay={0.8} duration={9} parallaxSpeed={0.5} />
        <AmbientBubble size={105} initialX="5%" initialY="50%" delay={2.2} duration={8} parallaxSpeed={0.7} />
        <AmbientBubble size={125} initialX="90%" initialY="60%" delay={1.2} duration={11} parallaxSpeed={0.6} />
        <AmbientBubble size={95} initialX="20%" initialY="35%" delay={3.5} duration={7} parallaxSpeed={0.8} />
        <AmbientBubble size={135} initialX="70%" initialY="80%" delay={0.3} duration={10} parallaxSpeed={0.4} />
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
