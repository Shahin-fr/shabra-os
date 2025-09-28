'use client';

import { useState } from 'react';

import { WikiContent } from '@/components/wiki/WikiContent';
import { WikiSidebar } from '@/components/wiki/WikiSidebar';
import { ToastProvider } from '@/components/ui/toast';

export default function WikiPage() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ToastProvider>
      <div className='flex flex-col lg:flex-row h-screen bg-background p-2 sm:p-4 lg:p-6 xl:p-8 gap-4 lg:gap-6 rounded-2xl'>
        {/* Sidebar */}
        <div className='lg:w-80 w-full lg:flex-shrink-0'>
          <WikiSidebar
            onDocumentSelect={setSelectedDocument}
            selectedDocument={selectedDocument}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Main Content Area */}
        <div className='flex-1 flex flex-col min-h-0'>
          {/* Header */}
          <div className='border border-gray-200 bg-white rounded-2xl mb-4 lg:mb-6 shadow-sm'>
            <div className='flex h-16 lg:h-20 items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-6'>
              <div>
                <h1 className='text-2xl lg:text-3xl font-bold text-pink-400 mb-1 lg:mb-2'>شبرالوگ</h1>
                <p className='text-sm lg:text-base text-gray-600'>
                  مرجع کامل راهنماها و مستندات Shabra OS
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-auto'>
            <WikiContent 
              key={refreshKey} 
              documentId={selectedDocument} 
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

