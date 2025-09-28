'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateMeetingForm } from '@/components/meetings/CreateMeetingForm';
import { useAuth } from '@/hooks/useAuth';
import { isAdminOrManagerUser } from '@/lib/auth-utils';
import { useEffect } from 'react';

export default function NewMeetingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleSuccess = () => {
    router.push('/meetings');
  };

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!isLoading && user && !isAdminOrManagerUser(user)) {
      router.push('/meetings');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff0a54]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if user doesn't have permission
  if (!user || !isAdminOrManagerUser(user)) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/meetings')}
          >
            <ArrowLeft className="rtl:rotate-180 h-4 w-4 ms-2" />
            بازگشت
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ایجاد جلسه جدید</h1>
            <p className="text-gray-600 mt-1">
              جلسه جدید را برنامه‌ریزی و شرکت‌کنندگان را دعوت کنید
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <CreateMeetingForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
