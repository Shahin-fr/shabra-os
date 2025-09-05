import { Users, Mail, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export default async function TeamPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className='container mx-auto max-w-7xl space-y-8'>
      {/* Page Header */}
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-bold text-gray-900'>اعضای تیم</h1>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          مدیریت و مشاهده اعضای تیم شبرا
        </p>
      </div>

      {/* Team Members Card */}
      <Card className='max-w-4xl mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-3 text-2xl font-semibold text-gray-900'>
            <div className='w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center'>
              <Users className='h-5 w-5 text-[#ff0a54]' />
            </div>
            لیست اعضای تیم
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <User className='h-8 w-8 text-gray-400' />
              </div>
              <p className='text-gray-500'>هنوز هیچ عضوی در تیم وجود ندارد</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className='group p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300'
                >
                  <div className='flex items-center gap-4'>
                    <Avatar className='w-12 h-12'>
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className='bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 text-[#ff0a54] font-semibold'>
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-gray-900 truncate'>
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Mail className='h-3 w-3' />
                        <span className='truncate'>{user.email}</span>
                      </div>
                      <div className='flex items-center gap-2 mt-1'>
                        <div
                          className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                        />
                        <span className='text-xs text-gray-500'>
                          {user.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
