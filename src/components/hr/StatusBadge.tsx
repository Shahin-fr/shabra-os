import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getStatusBadge, LeaveStatus } from '@/types/hr';

interface StatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: badgeClassName } = getStatusBadge(status);

  const getIcon = (status: LeaveStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className='h-3 w-3 me-1' />;
      case 'APPROVED':
        return <CheckCircle className='h-3 w-3 me-1' />;
      case 'REJECTED':
        return <XCircle className='h-3 w-3 me-1' />;
      case 'CANCELLED':
        return <XCircle className='h-3 w-3 me-1' />;
      default:
        return <AlertCircle className='h-3 w-3 me-1' />;
    }
  };

  return (
    <Badge className={`${badgeClassName} ${className || ''}`}>
      {getIcon(status)}
      {label}
    </Badge>
  );
}
