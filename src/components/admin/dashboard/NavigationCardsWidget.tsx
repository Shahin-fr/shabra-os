'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Calendar, Palette, FileText, BookOpen } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { NavigationCardProps } from '@/types/admin-dashboard';

const navigationCards: NavigationCardProps[] = [
  {
    title: 'تسک‌ها',
    description: 'مدیریت تسک‌ها',
    href: '/tasks',
    icon: FileText,
    color: '#ff0a54',
    hoverColor: '#ff0a54/50',
  },
  {
    title: 'استوری‌بورد',
    description: 'مدیریت محتوای بصری',
    href: '/storyboard',
    icon: Palette,
    color: '#9333ea',
    hoverColor: 'purple-500/50',
  },
  {
    title: 'تقویم محتوا',
    description: 'برنامه‌ریزی محتوا',
    href: '/content-calendar',
    icon: Calendar,
    color: '#ff0a54',
    hoverColor: '#ff0a54/50',
  },
  {
    title: 'شبرالوگ',
    description: 'پایگاه دانش',
    href: '/wiki',
    icon: BookOpen,
    color: '#22c55e',
    hoverColor: 'green-500/50',
  },
];

export function NavigationCardsWidget() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <OptimizedMotion as="section" className="space-y-8" variants={containerVariants}>
      <OptimizedMotion
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.7 }}
      >
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200 mb-2">
          دسترسی سریع
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          لینک‌های مهم برای دسترسی آسان به بخش‌های مختلف
        </p>
      </OptimizedMotion>

      <OptimizedMotion
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {navigationCards.map((card) => (
          <OptimizedMotion key={card.href} variants={itemVariants}>
            <Link href={card.href}>
              <Card
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 backdrop-blur-xl bg-white/20 border border-white/30 hover:border-[#ff0a54]/50"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(40px)',
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.1),
                    0 4px 16px rgba(255, 10, 84, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4)
                  `,
                }}
              >
                <CardContent className="p-8 text-center">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300`}
                    style={{
                      backgroundColor: `${card.color}20`,
                    }}
                  >
                    <card.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-lg">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </OptimizedMotion>
        ))}
      </OptimizedMotion>
    </OptimizedMotion>
  );
}

