import { Badge } from '@/components/ui/badge';
import { Shield, User } from 'lucide-react';
import { UserRole, ROLE_LABELS, ROLE_BADGE_COLORS } from '@/types/hr';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const getIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className='h-3 w-3 me-1' />;
      case 'MANAGER':
        return <Shield className='h-3 w-3 me-1' />;
      case 'EMPLOYEE':
        return <User className='h-3 w-3 me-1' />;
      default:
        return <User className='h-3 w-3 me-1' />;
    }
  };

  return (
    <Badge className={`${ROLE_BADGE_COLORS[role]} ${className || ''}`}>
      {getIcon(role)}
      {ROLE_LABELS[role]}
    </Badge>
  );
}
