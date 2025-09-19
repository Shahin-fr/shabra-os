'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ClientOnly from '@/components/ui/ClientOnly';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  pulse: number;
}

/**
 * AnimatedBackground Component - Page-wide particle system
 * 
 * A persistent, page-wide animated background with floating particles
 * that creates visual interest without being distracting.
 */
export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create initial particles
    const initialParticles: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.6 + 0.2,
      driftX: (Math.random() - 0.5) * 0.5,
      driftY: (Math.random() - 0.5) * 0.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    setParticles(initialParticles);

    // Animate particles
    const animate = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: (particle.x + particle.driftX + 100) % 100,
          y: (particle.y + particle.driftY + 100) % 100,
          pulse: particle.pulse + 0.02,
          opacity: 0.2 + Math.sin(particle.pulse) * 0.4,
        }))
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <ClientOnly>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-[#E000A0]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </ClientOnly>
  );
}