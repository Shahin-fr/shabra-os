"use client";

import { LayoutDashboard, FolderOpen, Users, Settings, BarChart3, Instagram, BookOpen, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

// Create motion-compatible Link component
const MotionLink = motion(Link);

export function Sidebar() {
  const pathname = usePathname();
  
  const navigationItems = [
    { href: "/", label: "داشبورد", icon: LayoutDashboard },
    { href: "/projects", label: "پروژه‌ها", icon: FolderOpen },
    { href: "/storyboard", label: "استوری‌بورد", icon: Instagram },
    { href: "/content-calendar", label: "تقویم محتوا", icon: Calendar },
    { href: "/docs", label: "پایگاه دانش", icon: BookOpen },
    { href: "/team", label: "تیم", icon: Users },
    { href: "/calendar", label: "تقویم", icon: Calendar },
    { href: "/analytics", label: "تحلیل‌ها", icon: BarChart3 },
    { href: "/settings", label: "تنظیمات", icon: Settings },
  ];

  return (
    <div className="hidden md:block fixed right-0 top-0 h-full w-64 z-30 flex flex-col">
      {/* Floating Logo - Enhanced spacing */}
      <motion.div 
        className="flex justify-center pt-8 pb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Link href="/" className="block">
          <motion.div 
            className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/30 hover:border-white/50 transition-all duration-300"
            style={{
              boxShadow: `
                0 8px 32px rgba(255, 10, 84, 0.3),
                0 4px 16px rgba(255, 10, 84, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: `
                0 12px 40px rgba(255, 10, 84, 0.4),
                0 6px 20px rgba(255, 10, 84, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.9)
              `
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Image
              src="/images/shabra-logo.jpg"
              alt="Shabra Logo"
              width={112}
              height={112}
              className="w-full h-full object-cover"
              priority
            />
          </motion.div>
        </Link>
      </motion.div>
      
      {/* Liquid Glass Button Pod - Enhanced glass effect */}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div 
          className="rounded-2xl p-4 w-full max-w-48"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.2),
              0 10px 30px rgba(255, 10, 84, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <nav className="flex flex-col gap-3">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                >
                  <MotionLink
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                      "hover:text-white",
                      isActive 
                        ? "text-white" 
                        : "text-muted-foreground hover:text-white/90"
                    )}
                    style={{
                      background: isActive 
                        ? 'rgba(255, 10, 84, 0.15)'
                        : 'transparent',
                      boxShadow: isActive 
                        ? `
                          0 4px 15px rgba(255, 10, 84, 0.2),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `
                        : 'none',
                      border: isActive ? '1px solid rgba(255, 10, 84, 0.3)' : '1px solid transparent'
                    }}
                    whileHover={{
                      background: isActive 
                        ? 'rgba(255, 10, 84, 0.2)'
                        : 'rgba(255, 10, 84, 0.1)',
                      boxShadow: isActive 
                        ? `
                          0 6px 20px rgba(255, 10, 84, 0.25),
                          inset 0 1px 0 rgba(255, 255, 255, 0.4)
                        `
                        : `
                          0 4px 15px rgba(255, 10, 84, 0.15),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <Icon className={cn(
                        "h-4 w-4",
                        isActive ? "text-[#ff0a54]" : "text-muted-foreground"
                      )} />
                    </motion.div>
                    <span className={cn(
                      isActive ? "text-[#ff0a54]" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </MotionLink>
                </motion.div>
              );
            })}
          </nav>
        </motion.div>
      </div>
    </div>
  );
}
