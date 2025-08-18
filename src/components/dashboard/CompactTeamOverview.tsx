"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: "شاهین",
    status: "online"
  },
  {
    id: 2,
    name: "سارا",
    status: "online"
  },
  {
    id: 3,
    name: "علی",
    status: "away"
  },
  {
    id: 4,
    name: "فاطمه",
    status: "online"
  }
];

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
    <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
            <Users className="h-4 w-4 text-[#ff0a54]" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              اعضای تیم
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Compact Avatar Display */}
          <div className="flex items-center justify-center">
            <div className="flex -space-x-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="relative group">
                  <Avatar className="w-8 h-8 border-2 border-white/20 hover:scale-110 transition-transform duration-200 cursor-pointer">
                    <AvatarImage src={`/api/placeholder/32/32?name=${member.name}`} alt={member.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 text-[#ff0a54] font-semibold text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${getStatusColor(member.status)} rounded-full border border-white/20`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Stats */}
          <div className="flex justify-center gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{teamMembers.length}</div>
              <div className="text-xs text-gray-600">کل اعضا</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {teamMembers.filter(m => m.status === 'online').length}
              </div>
              <div className="text-xs text-gray-600">آنلاین</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
