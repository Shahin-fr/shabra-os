'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Lightbulb, BarChart3 } from 'lucide-react';

import { StoryTypeManager } from '@/components/admin/StoryTypeManager';
import { StoryIdeaManager } from '@/components/admin/StoryIdeaManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StoryboardAdminPage() {
  const [activeTab, setActiveTab] = useState('story-types');

  const tabs = [
    {
      id: 'story-types',
      label: 'انواع استوری',
      icon: Palette,
      description: 'مدیریت انواع استوری و تنظیمات آن‌ها',
    },
    {
      id: 'story-ideas',
      label: 'ایده‌های استوری',
      icon: Lightbulb,
      description: 'مدیریت ایده‌های استوری و محتوای آن‌ها',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 flex items-center justify-center'>
              <Settings className='h-6 w-6 text-[#ff0a54]' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                مدیریت استوری‌بورد
              </h1>
              <p className='text-gray-600'>
                مدیریت کامل انواع استوری و ایده‌های محتوا
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'
        >
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                انواع استوری
              </CardTitle>
              <Palette className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>8</div>
              <p className='text-xs text-muted-foreground'>
                انواع مختلف استوری
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                ایده‌های استوری
              </CardTitle>
              <Lightbulb className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>35</div>
              <p className='text-xs text-muted-foreground'>
                ایده‌های آماده استفاده
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                دسته‌بندی‌ها
              </CardTitle>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>7</div>
              <p className='text-xs text-muted-foreground'>دسته‌بندی مختلف</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid w-full grid-cols-2'>
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className='flex items-center gap-2'
                >
                  <tab.icon className='h-4 w-4' />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value='story-types' className='space-y-6'>
              <StoryTypeManager />
            </TabsContent>

            <TabsContent value='story-ideas' className='space-y-6'>
              <StoryIdeaManager />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
