'use client';

import { useState } from 'react';
import { WikiContent } from '@/components/wiki/WikiContent';
import { WikiSidebar } from '@/components/wiki/WikiSidebar';

export default function WikiPage() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  return (
    <div className='flex h-screen bg-background p-4 sm:p-6 lg:p-8 gap-6 rounded-2xl'>
      {/* Sidebar */}
      <WikiSidebar
        onDocumentSelect={setSelectedDocument}
        selectedDocument={selectedDocument}
      />

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <div className='border border-gray-200 bg-white rounded-2xl mb-6 shadow-sm'>
          <div className='flex h-20 items-center justify-between px-8 py-6'>
            <div>
              <h1 className='text-3xl font-bold text-pink-400 mb-2'>شبرالوگ</h1>
              <p className='text-base text-gray-600'>
                مرجع کامل راهنماها و مستندات Shabra OS
              </p>
            </div>

            {/* Create button removed - content managed via markdown files */}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-auto'>
          <WikiContent documentId={selectedDocument} />
        </div>
      </div>
    </div>
  );
}
