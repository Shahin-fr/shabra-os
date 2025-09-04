import { LucideIcon } from 'lucide-react';

import { CardHeader, CardTitle } from '@/components/ui/card';

interface CardHeaderWithIconProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function CardHeaderWithIcon({
  icon: Icon,
  title,
  subtitle,
  iconColor = '#ff0a54',
  iconBgColor = 'from-[#ff0a54]/20 to-[#ff0a54]/40',
}: CardHeaderWithIconProps) {
  return (
    <CardHeader className='pb-3'>
      <div className='flex items-center gap-3'>
        <div
          className={`w-10 h-10 bg-gradient-to-br ${iconBgColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className='h-5 w-5' style={{ color: iconColor }} />
        </div>
        <div>
          <CardTitle className='text-lg font-semibold text-gray-900'>
            {title}
          </CardTitle>
          <p className='text-sm text-gray-600'>{subtitle}</p>
        </div>
      </div>
    </CardHeader>
  );
}
