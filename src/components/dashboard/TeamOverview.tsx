'use client';

import { Users } from 'lucide-react';
import { useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { CardHeaderWithIcon } from '@/components/ui/CardHeaderWithIcon';
import { mockTeamMembers } from '@/lib/mock-data';

export function TeamOverview() {
  // Memoize expensive computations to prevent recalculation on every render
  const statusCounts = useMemo(
    () => ({
      online: mockTeamMembers.filter(m => m.status === 'online').length,
      away: mockTeamMembers.filter(m => m.status === 'away').length,
      total: mockTeamMembers.length,
    }),
    []
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl w-full'>
      <CardHeaderWithIcon
        icon={Users}
        title='اعضای تیم'
        subtitle='وضعیت آنلاین'
      />
      <CardContent>
        <div className='space-y-3'>
          {/* Overlapping Avatars */}
          <div className='flex items-center justify-center'>
            <div className='flex -space-x-3'>
              {mockTeamMembers.slice(0, 5).map(member => (
                <div key={member.id} className='relative group'>
                  <Avatar className='w-10 h-10 border-2 border-white/20 hover:scale-110 transition-transform duration-200 cursor-pointer'>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className='bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 text-[#ff0a54] font-semibold'>
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white/20`}
                  ></div>

                  {/* Tooltip */}
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10'>
                    {member.name}
                    <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
                  </div>
                </div>
              ))}
              {mockTeamMembers.length > 5 && (
                <div className='relative group'>
                  <div className='w-10 h-10 bg-gradient-to-br from-gray-400/20 to-gray-500/40 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-semibold text-gray-600 hover:scale-110 transition-transform duration-200 cursor-pointer'>
                    +{mockTeamMembers.length - 5}
                  </div>

                  {/* Tooltip */}
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10'>
                    {mockTeamMembers.length - 5} عضو دیگر
                    <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Stats */}
          <div className='grid grid-cols-3 gap-2 text-center'>
            <div className='p-2 rounded-lg bg-white/5'>
              <div className='text-lg font-bold text-gray-900'>
                {statusCounts.total}
              </div>
              <div className='text-xs text-gray-600'>کل اعضا</div>
            </div>
            <div className='p-2 rounded-lg bg-white/5'>
              <div className='text-lg font-bold text-green-600'>
                {statusCounts.online}
              </div>
              <div className='text-xs text-gray-600'>آنلاین</div>
            </div>
            <div className='p-2 rounded-lg bg-white/5'>
              <div className='text-lg font-bold text-yellow-600'>
                {statusCounts.away}
              </div>
              <div className='text-xs text-gray-600'>مشغول</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
