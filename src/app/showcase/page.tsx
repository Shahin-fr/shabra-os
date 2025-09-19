import HeroSection from './components/hero-section';
import ProblemSection from './components/problem-section';
import PhilosophySection from './components/philosophy-section';
import EcosystemSection from './components/ecosystem-section';
import TechStackSection from './components/tech-stack-section';
import RoadmapSection from './components/roadmap-section';
import AboutSection from './components/about-section';
import AnimatedBackground from './components/animated-background';

/**
 * Showcase Page for Shabra OS - Completely Re-architected
 * 
 * A narrative-driven, cinematic showcase page featuring:
 * - Sophisticated animated graphics
 * - Interactive 3D visualizations
 * - Full-screen immersive experiences
 * - Seamless transitions between sections
 * - RTL/LTR support throughout
 * - Professional, Awwwards-quality design
 */
export default function ShowcasePage() {
  return (
    <main className="min-h-screen bg-[#050505] overflow-x-hidden">
      {/* Page-wide Animated Background */}
      <AnimatedBackground />
      
      {/* Content Wrapper - All sections rendered above background */}
      <div className="relative z-10">
        {/* Hero Section - Introduction to a powerful, focused solution */}
        <HeroSection />
        
        {/* Problem Section - Visualizing the chaos of scattered tools */}
        <ProblemSection />
        
        {/* Philosophy Section - Core principles and approach */}
        <PhilosophySection />
        
        {/* Ecosystem Section - Introducing the structured, powerful modules */}
        <EcosystemSection />
        
        {/* Tech Stack Section - The foundation */}
        <TechStackSection />
        
        {/* Roadmap Section - A clear, forward-thinking vision for the future */}
        <RoadmapSection />
        
        {/* About Section - The creator */}
        <AboutSection />
      </div>
    </main>
  );
}