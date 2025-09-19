'use client';

import { Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { CardHeaderWithIcon } from '@/components/ui/CardHeaderWithIcon';
import { mockCompactTeamMembers } from '@/lib/mock-data';

export function CompactTeamOverview() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl h-full'>
      <CardHeaderWithIcon
        icon={Users}
        title='اعضای تیم'
        subtitle=''
        iconBgColor='from-[#ff0a54]/20 to-[#ff0a54]/40'
      />
      <CardContent>
        <div className='space-y-3'>
          {/* Compact Avatar Display */}
          <div className='flex items-center justify-center'>
            <div className='flex -space-x-2'>
              {mockCompactTeamMembers.map(member => (
                <div key={member.id} className='relative group'>
                  <Avatar className='w-8 h-8 border-2 border-white/20 hover:scale-110 transition-transform duration-200 cursor-pointer'>
                    <AvatarImage
                      src={`/api/placeholder/32/32?name=${member.name}`}
                      alt={member.name}
                    />
                    <AvatarFallback className='bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 text-[#ff0a54] font-semibold text-xs'>
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${getStatusColor(member.status)} rounded-full border border-white/20`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Stats */}
          <div className='flex justify-center gap-4 text-center'>
            <div>
              <div className='text-lg font-bold text-gray-900'>
                {mockCompactTeamMembers.length}
              </div>
              <div className='text-xs text-gray-600'>کل اعضا</div>
            </div>
            <div>
              <div className='text-lg font-bold text-green-600'>
                {
                  mockCompactTeamMembers.filter(m => m.status === 'online')
                    .length
                }
              </div>
              <div className='text-xs text-gray-600'>آنلاین</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

